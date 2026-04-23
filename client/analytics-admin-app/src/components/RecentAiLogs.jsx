import { useQuery } from '@apollo/client/react'
import { RECENT_AI_INSIGHT_LOGS_QUERY } from '../graphql/queries'

function formatInsightType(value) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export default function RecentAiLogs() {
  const { data, loading, error } = useQuery(RECENT_AI_INSIGHT_LOGS_QUERY, {
    variables: { limit: 8 },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const logs = data?.recentAiInsightLogs || []

  return (
    <section className="aa-card aa-card--tall">
      <div className="aa-card__head">
        <div className="aa-card__head-text">
          <span className="aa-card__eyebrow">Audit trail</span>
          <span className="aa-card__title">Recent AI logs</span>
        </div>
      </div>

      <div className="aa-card__body">
        {loading ? (
          <div className="aa-state">Loading recent AI activity...</div>
        ) : error ? (
          <div className="aa-state aa-state--error">{error.message}</div>
        ) : logs.length === 0 ? (
          <div className="aa-state">No AI insight logs are available yet.</div>
        ) : (
          <div className="aa-logs">
            {logs.map((log) => (
              <article className="aa-log" key={log.id}>
                <div className="aa-log__top">
                  <span className="aa-log__type">{formatInsightType(log.insightType)}</span>
                  <span className="aa-log__date">{formatDate(log.createdAt)}</span>
                </div>
                <span className="aa-log__user">
                  {log.requestedByUsername || 'Unknown user'}
                </span>
                <p className="aa-log__text">{log.responseText}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
