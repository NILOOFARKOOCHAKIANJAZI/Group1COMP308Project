import { useQuery } from '@apollo/client/react'
import { DASHBOARD_STATS_QUERY } from '../graphql/queries'

function StatCard({ label, value, tone = 'default' }) {
  return (
    <div className={`aa-stat aa-stat--${tone}`}>
      <span className="aa-stat__label">{label}</span>
      <strong className="aa-stat__value">{value}</strong>
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
      <section className="aa-stats">
        {Array.from({ length: 7 }).map((_, index) => (
          <div className="aa-stat" key={index}>
            <span className="aa-stat__label">Loading</span>
            <strong className="aa-stat__value">--</strong>
          </div>
        ))}
      </section>
    )
  }

  if (error || !data?.dashboardStats) {
    return (
      <div className="aa-message aa-message--error">
        {error?.message || 'Unable to load dashboard statistics.'}
      </div>
    )
  }

  const stats = data.dashboardStats

  return (
    <section className="aa-stats">
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
