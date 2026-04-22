import { useQuery } from '@apollo/client/react'
import { DASHBOARD_STATS_QUERY } from '../graphql/queries'

function StatCard({ label, value, tone = 'default' }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  )
}

export default function StatsCards() {
  const { data, loading, error } = useQuery(DASHBOARD_STATS_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  if (loading) {
    return (
      <section className="stats-grid">
        {Array.from({ length: 7 }).map((_, index) => (
          <div className="panel-card loading-card" key={index}>
            Loading statistics...
          </div>
        ))}
      </section>
    )
  }

  if (error || !data?.dashboardStats) {
    return (
      <section className="panel-card">
        <h2>Dashboard summary</h2>
        <div className="panel-error">
          {error?.message || 'Unable to load dashboard statistics.'}
        </div>
      </section>
    )
  }

  const stats = data.dashboardStats

  return (
    <section className="stats-grid">
      <StatCard label="Total Issues" value={stats.totalIssues} />
      <StatCard label="Open Issues" value={stats.openIssues} tone="warning" />
      <StatCard label="Urgent Alerts" value={stats.urgentIssues} tone="danger" />
      <StatCard label="Resolved Issues" value={stats.resolvedIssues} tone="success" />
      <StatCard label="Comments" value={stats.totalComments} />
      <StatCard label="Upvotes" value={stats.totalUpvotes} />
      <StatCard label="Volunteer Interests" value={stats.totalVolunteerInterests} tone="accent" />
    </section>
  )
}