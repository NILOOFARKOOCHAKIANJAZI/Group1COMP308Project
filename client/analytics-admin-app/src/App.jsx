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
  const map = {
    resident: 'Resident',
    staff: 'Municipal Staff',
    advocate: 'Community Advocate',
  }
  return map[role] || role || 'Unknown'
}

function AnalyticsView() {
  return (
    <>
      <header className="aa-page-header">
        <div className="aa-page-header__title-group">
          <span className="aa-eyebrow">Operations</span>
          <h1 className="aa-page-header__title">Analytics and insights</h1>
          <p className="aa-page-header__subtitle">
            Track issue volume, category mix, and neighborhood hotspots. Generate AI trend insights on demand and audit recent AI activity.
          </p>
        </div>
      </header>

      <StatsCards />

      <section className="aa-grid aa-grid--two">
        <CategoryBreakdown />
        <NeighborhoodHotspots />
      </section>

      <section className="aa-grid aa-grid--lopsided">
        <TrendInsightsPanel />
        <RecentAiLogs />
      </section>
    </>
  )
}

function AiAssistantView({ currentUser }) {
  return <AiChatBox currentUser={currentUser} />
}

function AnalyticsAdminShell({ view }) {
  //Get the current authenticated user and check if they have the required role to access the analytics admin features. Show appropriate loading, error, and access denied states based on the query result and user role.
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const currentUser = data?.currentUser || null
  const isPrivileged = ['staff', 'advocate'].includes(currentUser?.role)

  if (loading) {
    return (
      <div className="aa-shell">
        <div className="aa-loading">Checking authenticated session and role access...</div>
      </div>
    )
  }

  if (error && !currentUser) {
    return (
      <div className="aa-shell">
        <div className="aa-message aa-message--error">
          Unable to load the authenticated user. {error.message}
        </div>
      </div>
    )
  }

  // If there is no authenticated user, show an access denied message prompting
  if (!currentUser) {
    return (
      <div className="aa-shell">
        <AccessDenied
          title="Authentication required"
          description="Please sign in through the Auth module to access analytics, administration tools, and the AI assistant."
        />
      </div>
    )
  }

  // if not a privileged user, show an access denied message with the current user's role and the intended audience for the analytics admin features
  if (!isPrivileged) {
    return (
      <div className="aa-shell">
        <AccessDenied
          title="Restricted access"
          description={`This module is intended for Municipal Staff and Community Advocate users. You are currently signed in as ${formatRole(currentUser.role)}.`}
        />
      </div>
    )
  }

  return (
    <div className="aa-shell">
      {view === 'ai' ? (
        <AiAssistantView currentUser={currentUser} />
      ) : (
        <AnalyticsView />
      )}
    </div>
  )
}

// The main App component wraps the AnalyticsAdminShell with the ApolloProvider to provide GraphQL data access throughout the component tree. 
// It also accepts a 'view' prop to determine whether to show the analytics dashboard or the AI assistant interface, defaulting to 'analytics'.
export default function App({ view = 'analytics' }) {
  return (
    <ApolloProvider client={client}>
      <AnalyticsAdminShell view={view} />
    </ApolloProvider>
  )
}
