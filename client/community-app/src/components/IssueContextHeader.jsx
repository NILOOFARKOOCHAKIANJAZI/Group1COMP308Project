import { useQuery } from '@apollo/client/react'
import { ISSUE_CONTEXT_QUERY } from '../graphql/queries'

const STATUS_TONE = {
  reported: 'tone-blue',
  triaged: 'tone-blue',
  in_progress: 'tone-amber',
  resolved: 'tone-green',
  closed: 'tone-green',
}

const PRIORITY_TONE = {
  low: 'tone-blue',
  medium: 'tone-amber',
  high: 'tone-red',
}

function formatLabel(value) {
  if (!value) return ''
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return ''
  const source = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value
  const date = new Date(source)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function IssueContextHeader({ issueId }) {
  const { data, loading, error } = useQuery(ISSUE_CONTEXT_QUERY, {
    variables: { id: issueId },
    fetchPolicy: 'cache-and-network',
    skip: !issueId,
  })

  const issue = data?.issueById

  if (loading && !issue) {
    return <p className="loading-prose">Loading issue context</p>
  }

  if (error || !issue) {
    return null
  }

  const statusTone = STATUS_TONE[issue.status] || 'tone-blue'
  const priorityTone = PRIORITY_TONE[issue.priority] || 'tone-blue'

  return (
    <section className="issue-context" aria-label="Issue under discussion">
      <div className="issue-context__body">
        <p className="issue-context__eyebrow">Community discussion for</p>
        <h2 className="issue-context__title">{issue.title}</h2>
        <div className="issue-context__meta">
          <span className={`issue-context__chip issue-context__chip--${statusTone}`}>
            {formatLabel(issue.status)}
          </span>
          <span className={`issue-context__chip issue-context__chip--${priorityTone}`}>
            {formatLabel(issue.priority)} priority
          </span>
          <span className="issue-context__chip issue-context__chip--no-dot">
            {formatLabel(issue.category)}
          </span>
        </div>
        {issue.description && (
          <p className="issue-context__description">{issue.description}</p>
        )}
        <div className="issue-context__footer">
          <span>Reported by {issue.reportedByUsername}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{formatDate(issue.createdAt)}</span>
          {issue.location?.neighborhood && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{issue.location.neighborhood}</span>
            </>
          )}
        </div>
      </div>

      {issue.photoUrl && (
        <div className="issue-context__media">
          <img src={issue.photoUrl} alt={issue.title} loading="lazy" />
        </div>
      )}
    </section>
  )
}
