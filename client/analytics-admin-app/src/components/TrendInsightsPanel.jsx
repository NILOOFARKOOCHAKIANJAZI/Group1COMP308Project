import { useQuery } from '@apollo/client/react'
import { TREND_INSIGHTS_QUERY } from '../graphql/queries'

export default function TrendInsightsPanel() {
  const { data, loading, error, refetch } = useQuery(TREND_INSIGHTS_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const payload = data?.trendInsights

  return (
    <section className="panel-card panel-card-tall">
      <div className="panel-header">
        <div>
          <p className="eyebrow">AI insights</p>
          <h2>Trend Insights</h2>
        </div>

        <button type="button" className="panel-action-btn" onClick={() => refetch()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? <div className="panel-loading">Generating municipal trend insights...</div> : null}

      {error ? <div className="panel-error">{error.message}</div> : null}

      {!loading && !error && payload && !payload.success ? (
        <div className="panel-error">{payload.message || 'Unable to generate trend insights.'}</div>
      ) : null}

      {!loading && !error && payload?.success ? (
        <div className="insight-text-block">
          <p>{payload.text}</p>
        </div>
      ) : null}
    </section>
  )
}