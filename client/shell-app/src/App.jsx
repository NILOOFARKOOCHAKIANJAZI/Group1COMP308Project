import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { ApolloProvider, useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import client from './apollo/client'
import { CURRENT_USER_QUERY } from './graphql/queries'
import { LOGOUT_MUTATION } from './graphql/mutations'

const AuthRemote = lazy(() => import('authApp/AuthApp'))
const IssueRemote = lazy(() => import('issueApp/IssueApp'))
const CommunityRemote = lazy(() => import('communityApp/CommunityApp'))
const AnalyticsRemote = lazy(() => import('analyticsAdminApp/AnalyticsAdminApp'))

const VIEWS = ['home', 'auth', 'issue', 'community', 'analytics']
const AUTH_CHANGED_EVENT = 'civiccase-auth-changed'
const SELECTED_ISSUE_STORAGE_KEY = 'shell_selected_issue_id'

function getViewFromHash() {
  const raw = window.location.hash.replace('#', '').trim().toLowerCase()
  return VIEWS.includes(raw) ? raw : 'home'
}

function formatRole(role) {
  if (!role) return 'Unknown'

  const roleMap = {
    resident: 'Resident',
    staff: 'Municipal Staff',
    advocate: 'Community Advocate',
  }

  return roleMap[role] || role
}

function AppShell() {
  const apolloClient = useApolloClient()

  const [activeView, setActiveView] = useState(getViewFromHash())
  const [selectedIssueId, setSelectedIssueId] = useState(
    localStorage.getItem(SELECTED_ISSUE_STORAGE_KEY) || '',
  )

  const { data, loading, error, refetch } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  })

  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION)

  const currentUser = data?.currentUser || null
  const isAuthenticated = Boolean(currentUser)

  useEffect(() => {
    const onHashChange = () => setActiveView(getViewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    localStorage.setItem(SELECTED_ISSUE_STORAGE_KEY, selectedIssueId)
  }, [selectedIssueId])

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#home'
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated && activeView !== 'auth') {
      window.location.hash = '#auth'
    }
  }, [isAuthenticated, activeView, loading])

  useEffect(() => {
    const handleAuthChanged = async () => {
      await apolloClient.clearStore().catch(() => {})
      await refetch().catch(() => {})
    }

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
    }
  }, [apolloClient, refetch])

  const displayView = !isAuthenticated ? 'auth' : activeView

  const userInitials = useMemo(() => {
    if (!currentUser?.fullName && !currentUser?.username) return '?'

    const source = currentUser.fullName || currentUser.username
    const parts = source.trim().split(/\s+/)

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }, [currentUser])

  const handleLogout = async () => {
    try {
      await logoutMutation()
    } catch {
      // Continue cleanup even if backend logout fails.
    }

    await apolloClient.clearStore().catch(() => {})
    await refetch().catch(() => {})
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { type: 'logout' } }))
    window.location.hash = '#auth'
  }

  return (
    <div className="shell-root">
      <header className="shell-header">
        <div className="brand-block">
          <div className="brand-mark" />
          <div>
            <div className="brand-eyebrow">CivicCase</div>
            <h1 className="brand-title">Micro Frontend Shell</h1>
          </div>
        </div>

        <nav className="nav-bar">
          <NavButton
            label="Home"
            hash="home"
            active={displayView === 'home'}
            disabled={!isAuthenticated}
          />
          <NavButton label="Auth" hash="auth" active={displayView === 'auth'} />
          <NavButton
            label="Issue"
            hash="issue"
            active={displayView === 'issue'}
            disabled={!isAuthenticated}
          />
          <NavButton
            label="Community"
            hash="community"
            active={displayView === 'community'}
            disabled={!isAuthenticated}
          />
          <NavButton
            label="Analytics"
            hash="analytics"
            active={displayView === 'analytics'}
            disabled={!isAuthenticated}
          />
        </nav>

        <div className="header-right">
          {currentUser ? (
            <>
              <div className="user-chip">
                <div className="avatar">{userInitials}</div>
                <div className="user-meta">
                  <strong>{currentUser.fullName}</strong>
                  <span>{formatRole(currentUser.role)}</span>
                </div>
              </div>

              <button className="ghost-btn" onClick={handleLogout} disabled={logoutLoading}>
                {logoutLoading ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <button className="ghost-btn" onClick={() => (window.location.hash = '#auth')}>
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="shell-main">
        {error ? <div className="banner error">Gateway/auth check error: {error.message}</div> : null}

        {!currentUser && !loading ? (
          <div className="banner info">
            Please sign in through the Auth module to unlock the other micro frontends.
          </div>
        ) : null}

        {currentUser ? (
          <section className="context-panel">
            <div className="context-card">
              <span className="context-label">Current user</span>
              <strong>{currentUser.fullName}</strong>
              <small>{currentUser.email}</small>
            </div>

            <div className="context-card context-card--wide">
              <span className="context-label">Selected issue ID for Community module</span>
              <div className="context-row">
                <input
                  className="shell-input"
                  value={selectedIssueId}
                  onChange={(e) => setSelectedIssueId(e.target.value)}
                  placeholder="Paste an issue ID here"
                />
                <button className="primary-btn" onClick={() => (window.location.hash = '#community')}>
                  Open Community
                </button>
              </div>
              <small>Use this to send a specific issue ID into the Community remote.</small>
            </div>

            <div className="context-card">
              <span className="context-label">Gateway</span>
              <strong>{import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000/graphql'}</strong>
              <small>{loading ? 'Checking session...' : 'Connected through shell Apollo client'}</small>
            </div>
          </section>
        ) : null}

        <section className="remote-panel">
          <Suspense fallback={<RemoteFallback />}>
            {displayView === 'home' ? (
              <ShellHome currentUser={currentUser} selectedIssueId={selectedIssueId} />
            ) : null}

            {displayView === 'auth' ? <AuthRemote /> : null}

            {displayView === 'issue' && currentUser ? <IssueRemote /> : null}

            {displayView === 'community' && currentUser ? (
              <CommunityRemote issueId={selectedIssueId || undefined} currentUser={currentUser} />
            ) : null}

            {displayView === 'analytics' && currentUser ? <AnalyticsRemote /> : null}
          </Suspense>
        </section>
      </main>
    </div>
  )
}

function NavButton({ label, hash, active, disabled = false }) {
  return (
    <button
      className={`nav-btn ${active ? 'active' : ''}`}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          window.location.hash = `#${hash}`
        }
      }}
    >
      {label}
    </button>
  )
}

function ShellHome({ currentUser, selectedIssueId }) {
  return (
    <div className="home-grid">
      <div className="home-card">
        <span className="card-eyebrow">Architecture</span>
        <h2>Shell + 4 Remotes</h2>
        <p>
          This shell orchestrates Auth, Issue, Community, and Analytics/Admin micro frontends
          through Vite Module Federation.
        </p>
      </div>

      <div className="home-card">
        <span className="card-eyebrow">Authentication</span>
        <h2>{currentUser ? 'Authenticated' : 'Not signed in'}</h2>
        <p>
          {currentUser
            ? `Signed in as ${currentUser.fullName} (${formatRole(currentUser.role)}).`
            : 'Use the Auth module to sign in and unlock all protected views.'}
        </p>
      </div>

      <div className="home-card">
        <span className="card-eyebrow">Community context</span>
        <h2>{selectedIssueId || 'No issue selected'}</h2>
        <p>
          The Community remote can accept an issue ID from the shell so it opens directly on that
          issue.
        </p>
      </div>

      <div className="home-card">
        <span className="card-eyebrow">Demo order</span>
        <h2>Recommended flow</h2>
        <p>Auth → Issue Reporting → Community Engagement → Analytics/Admin</p>
      </div>
    </div>
  )
}

function RemoteFallback() {
  return (
    <div className="fallback-box">
      <div className="spinner" />
      <p>Loading remote module...</p>
    </div>
  )
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AppShell />
    </ApolloProvider>
  )
}