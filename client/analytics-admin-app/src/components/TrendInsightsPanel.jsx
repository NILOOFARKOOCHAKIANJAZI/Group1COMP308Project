import { useQuery } from '@apollo/client/react'
import { TREND_INSIGHTS_QUERY } from '../graphql/queries'

export default function TrendInsightsPanel() {
  const { data, loading, error, refetch } = useQuery(TREND_INSIGHTS_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const payload = data?.trendInsights

  return (
    <section className="aa-card aa-card--tall">
      <div className="aa-card__head">
        <div className="aa-card__head-text">
          <span className="aa-card__eyebrow">AI insights</span>
          <span className="aa-card__title">Trend insights</span>
        </div>

        <button
          type="button"
          className="aa-btn aa-btn--ghost"
          onClick={() => refetch()}
          disabled={loading}
        >
          {loading ? <span className="aa-btn__spinner" /> : null}
          {loading ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="aa-card__body">
        {loading ? (
          <div className="aa-state">Generating municipal trend insights...</div>
        ) : error ? (
          <div className="aa-state aa-state--error">{error.message}</div>
        ) : payload && !payload.success ? (
          <div className="aa-state aa-state--error">
            {payload.message || 'Unable to generate trend insights.'}
          </div>
        ) : payload?.success ? (
          <p className="aa-trend-text">{payload.text}</p>
        ) : (
          <div className="aa-state">No insights available.</div>
        )}
      </div>
    </section>
  )
}
