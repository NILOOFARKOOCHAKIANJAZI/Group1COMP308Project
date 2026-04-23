import { useQuery } from '@apollo/client/react'
import { COMMUNITY_SUMMARY_QUERY } from '../graphql/queries'

// fetches and displays a summary of community activity (total comments, upvotes, volunteers) for a specific issue.
export default function CommunitySummaryCard({ issueId }) {
  const { data, loading, error } = useQuery(COMMUNITY_SUMMARY_QUERY, {
    variables: { issueId },
    fetchPolicy: 'cache-and-network',
  })

  const summary = data?.communitySummary

  if (error) {
    return (
      <div className="alert alert--warning" role="alert">
        Could not load community activity.
      </div>
    )
  }

  if (loading && !data) {
    return <p className="loading-prose">Loading activity</p>
  }

  return (
    <div className="summary-strip" aria-label="Community activity summary">
      <SummaryChip
        label="Comments"
        value={summary?.totalComments ?? 0}
        variant="comments"
      />
      <SummaryChip
        label="Upvotes"
        value={summary?.totalUpvotes ?? 0}
        variant="upvotes"
      />
      <SummaryChip
        label="Volunteers"
        value={summary?.totalVolunteers ?? 0}
        variant="volunteers"
      />
    </div>
  )
}

function SummaryChip({ label, value, variant }) {
  return (
    <div className={`summary-chip summary-chip--${variant}`}>
      <span className="summary-chip__value">{value}</span>
      <span className="summary-chip__label">{label}</span>
    </div>
  )
}
