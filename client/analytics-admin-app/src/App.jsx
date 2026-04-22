import { ApolloProvider, useQuery } from '@apollo/client/react'
import client from './apollo'
import { CURRENT_USER_QUERY } from './graphql/queries'
import StatsCards from './components/StatsCards'
import CategoryBreakdown from './components/CategoryBreakdown'
import NeighborhoodHotspots from './components/NeighborhoodHotspots'
import TrendInsightsPanel from './components/TrendInsightsPanel'
import RecentAiLogs from './components/RecentAiLogs'
import AiChatBox from './components/AiChatBox'
import AccessDenied from './components/AccessDenied'
import './index.css'

function formatRole(role) {
  const roleMap = {
    resident: 'Resident',
    staff: 'Municipal Staff',
    advocate: 'Community Advocate',
  }

  return roleMap[role] || role || 'Unknown'
}

function AnalyticsAdminShell() {
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const currentUser = data?.currentUser || null
  const isPrivileged = ['staff', 'advocate'].includes(currentUser?.role)

  if (loading) {
    return (
      <div className="analytics-admin-app">
        <section className="analytics-hero">
          <p className="eyebrow">CivicCase</p>
          <h1>Analytics &amp; Administration</h1>
          <p className="hero-text">Checking authenticated session and role access...</p>
        </section>
      </div>
    )
  }

  if (error && !currentUser) {
    return (
      <div className="analytics-admin-app">
        <section className="analytics-hero">
          <p className="eyebrow">CivicCase</p>
          <h1>Analytics &amp; Administration</h1>
          <div className="panel-error">
            Unable to load the authenticated user. {error.message}
          </div>
        </section>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="analytics-admin-app">
        <AccessDenied
          title="Authentication required"
          description="Please sign in through the Auth module to access analytics, administration tools, and the AI assistant."
        />
      </div>
    )
  }

  if (!isPrivileged) {
    return (
      <div className="analytics-admin-app">
        <AccessDenied
          title="Restricted analytics access"
          description={`This module is intended for Municipal Staff and Community Advocate users. You are currently signed in as ${formatRole(currentUser.role)}.`}
        />
      </div>
    )
  }

  return (
    <div className="analytics-admin-app">
      <section className="analytics-hero">
        <div>
          <p className="eyebrow">CivicCase</p>
          <h1>Analytics &amp; Administration</h1>
          <p className="hero-text">
            Staff-facing analytics workspace for municipal issue monitoring, AI-generated insight
            review, hotspot analysis, and agentic chatbot support.
          </p>
        </div>

        <div className="hero-meta-grid">
          <div className="hero-meta-card">
            <span className="hero-meta-label">Current user</span>
            <strong>{currentUser.fullName}</strong>
            <small>{currentUser.email}</small>
          </div>

          <div className="hero-meta-card">
            <span className="hero-meta-label">Role</span>
            <strong>{formatRole(currentUser.role)}</strong>
            <small>Privileged analytics access granted</small>
          </div>

          <div className="hero-meta-card">
            <span className="hero-meta-label">Gateway</span>
            <strong>{import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000/graphql'}</strong>
            <small>Cookie-authenticated GraphQL gateway</small>
          </div>
        </div>

        <div className="hero-pill-row">
          <span className="hero-pill">Dashboard Analytics</span>
          <span className="hero-pill">Trend Insights</span>
          <span className="hero-pill">AI Logs</span>
          <span className="hero-pill">LangGraph + Gemini</span>
          <span className="hero-pill">Role Protected</span>
        </div>
      </section>

      <StatsCards />

      <section className="dashboard-grid">
        <CategoryBreakdown />
        <NeighborhoodHotspots />
      </section>

      <section className="dashboard-grid dashboard-grid-uneven">
        <TrendInsightsPanel />
        <RecentAiLogs />
      </section>

      <section className="chat-section">
        <AiChatBox />
      </section>
    </div>
  )
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AnalyticsAdminShell />
    </ApolloProvider>
  )
}