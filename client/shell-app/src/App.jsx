import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { ApolloProvider, useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import client from './apollo/client'
import { CURRENT_USER_QUERY } from './graphql/queries'
import { LOGOUT_MUTATION } from './graphql/mutations'
import CivicHelperBot from './components/CivicHelperBot'

const AuthRemote = lazy(() => import('authApp/AuthApp'))
const IssueRemote = lazy(() => import('issueApp/IssueApp'))
const CommunityRemote = lazy(() => import('communityApp/CommunityApp'))
const AnalyticsRemote = lazy(() => import('analyticsAdminApp/AnalyticsAdminApp'))

const VALID_VIEWS = ['auth', 'issue', 'community', 'analytics', 'ai']
const AUTH_CHANGED_EVENT = 'civiccase-auth-changed'
const ISSUE_SELECTED_EVENT = 'civiccase-issue-selected'
const SELECTED_ISSUE_STORAGE_KEY = 'shell_selected_issue_id'

const NAV_ITEMS_BY_ROLE = {
  resident: [
    { hash: 'issue', label: 'Issue' },
    { hash: 'community', label: 'Community' },
  ],
  staff: [
    { hash: 'issue', label: 'Issue Management' },
    { hash: 'community', label: 'Community' },
    { hash: 'analytics', label: 'Analytics' },
    { hash: 'ai', label: 'AI Assistant' },
  ],
  advocate: [
    { hash: 'issue', label: 'Issues' },
    { hash: 'community', label: 'Community' },
    { hash: 'analytics', label: 'Insights' },
    { hash: 'ai', label: 'AI Assistant' },
  ],
}

const DEFAULT_VIEW_BY_ROLE = {
  resident: 'issue',
  staff: 'issue',
  advocate: 'community',
}

function getViewFromHash() {
  const raw = window.location.hash.replace('#', '').trim().toLowerCase()
  return VALID_VIEWS.includes(raw) ? raw : null
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

function getNavForRole(role) {
  return NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.resident
}

function getDefaultViewForRole(role) {
  return DEFAULT_VIEW_BY_ROLE[role] || 'issue'
}

function isViewAllowedForRole(view, role) {
  if (view === 'auth') return true
  const allowed = getNavForRole(role).map((item) => item.hash)
  return allowed.includes(view)
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
  const userRole = currentUser?.role || 'resident'
  const navItems = useMemo(() => getNavForRole(userRole), [userRole])

  useEffect(() => {
    const onHashChange = () => setActiveView(getViewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    localStorage.setItem(SELECTED_ISSUE_STORAGE_KEY, selectedIssueId)
  }, [selectedIssueId])

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      if (activeView !== 'auth') {
        window.location.hash = '#auth'
      }
      return
    }

    const needsDefault =
      activeView === null ||
      activeView === 'auth' ||
      !isViewAllowedForRole(activeView, userRole)

    if (needsDefault) {
      window.location.hash = `#${getDefaultViewForRole(userRole)}`
    }
  }, [loading, isAuthenticated, activeView, userRole])

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

  useEffect(() => {
    const handleIssueSelected = (event) => {
      const nextId = event?.detail?.issueId
      if (typeof nextId === 'string' && nextId.length > 0) {
        setSelectedIssueId(nextId)
      }
    }

    window.addEventListener(ISSUE_SELECTED_EVENT, handleIssueSelected)
    return () => window.removeEventListener(ISSUE_SELECTED_EVENT, handleIssueSelected)
  }, [])

  const displayView = !isAuthenticated
    ? 'auth'
    : activeView && isViewAllowedForRole(activeView, userRole)
      ? activeView
      : getDefaultViewForRole(userRole)

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
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { type: 'logout' } }))
    window.location.replace(`${window.location.pathname}#auth`)
  }

  const showHelperBot = isAuthenticated && currentUser?.role === 'resident'

  return (
    <div className="shell-root">
      {isAuthenticated ? (
        <header className="shell-header">
          <div className="brand-block">
            <img src="/Logo.png" alt="Community Issue Tracker" className="brand-mark" />
            <div>
              <div className="brand-eyebrow">CivicCase</div>
              <h1 className="brand-title">Community Issue Tracker</h1>
            </div>
          </div>

          <nav className="nav-bar">
            {navItems.map((item) => (
              <NavButton
                key={item.hash}
                label={item.label}
                hash={item.hash}
                active={displayView === item.hash}
              />
            ))}
          </nav>

          <div className="header-right">
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
          </div>
        </header>
      ) : null}

      <main className="shell-main">
        {error ? <div className="banner error">Gateway/auth check error: {error.message}</div> : null}

        <section className="remote-panel">
          <Suspense fallback={<RemoteFallback />}>
            {displayView === 'auth' ? <AuthRemote /> : null}

            {displayView === 'issue' && isAuthenticated ? <IssueRemote /> : null}

            {displayView === 'community' && isAuthenticated ? (
              <CommunityRemote issueId={selectedIssueId || undefined} currentUser={currentUser} />
            ) : null}

            {displayView === 'analytics' &&
            isAuthenticated &&
            isViewAllowedForRole('analytics', userRole) ? (
              <AnalyticsRemote view="analytics" />
            ) : null}

            {displayView === 'ai' &&
            isAuthenticated &&
            isViewAllowedForRole('ai', userRole) ? (
              <AnalyticsRemote view="ai" />
            ) : null}
          </Suspense>
        </section>
      </main>

      {showHelperBot ? <CivicHelperBot /> : null}
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
