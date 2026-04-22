import { useQuery } from '@apollo/client/react'
import { RECENT_AI_INSIGHT_LOGS_QUERY } from '../graphql/queries'

function formatInsightType(value) {
  return value.replace(/\b\w/g, (match) => match.toUpperCase())
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString()
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

  return (
    <section className="panel-card panel-card-tall">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Audit trail</p>
          <h2>Recent AI Logs</h2>
        </div>
      </div>

      {loading ? <div className="panel-loading">Loading recent AI activity...</div> : null}

      {error ? <div className="panel-error">{error.message}</div> : null}

      {!loading && !error && (!data?.recentAiInsightLogs || data.recentAiInsightLogs.length === 0) ? (
        <div className="panel-empty">No AI insight logs are available yet.</div>
      ) : null}

      {!loading && !error && data?.recentAiInsightLogs?.length > 0 ? (
        <div className="logs-list">
          {data.recentAiInsightLogs.map((log) => (
            <article className="log-card" key={log.id}>
              <div className="log-card-top">
                <span className="log-type-badge">{formatInsightType(log.insightType)}</span>
                <small>{formatDate(log.createdAt)}</small>
              </div>

              <strong className="log-user">
                {log.requestedByUsername || 'Unknown user'}
              </strong>

              <p className="log-text">{log.responseText}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}