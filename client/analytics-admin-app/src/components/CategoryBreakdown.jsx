import { useQuery } from '@apollo/client/react'
import { ISSUES_BY_CATEGORY_QUERY } from '../graphql/queries'

function formatCategory(value) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export default function CategoryBreakdown() {
  const { data, loading, error } = useQuery(ISSUES_BY_CATEGORY_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Issue mix</p>
          <h2>Category Breakdown</h2>
        </div>
      </div>

      {loading ? <div className="panel-loading">Loading issue categories...</div> : null}

      {error ? <div className="panel-error">{error.message}</div> : null}

      {!loading && !error && (!data?.issuesByCategory || data.issuesByCategory.length === 0) ? (
        <div className="panel-empty">No categorized issue data is available yet.</div>
      ) : null}

      {!loading && !error && data?.issuesByCategory?.length > 0 ? (
        <div className="data-list">
          {data.issuesByCategory.map((item) => (
            <div className="data-row" key={item.category}>
              <div>
                <strong>{formatCategory(item.category)}</strong>
              </div>
              <span className="data-badge">{item.count}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}