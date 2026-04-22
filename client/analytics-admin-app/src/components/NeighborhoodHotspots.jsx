import { useQuery } from '@apollo/client/react'
import { NEIGHBORHOOD_HOTSPOTS_QUERY } from '../graphql/queries'

export default function NeighborhoodHotspots() {
  const { data, loading, error } = useQuery(NEIGHBORHOOD_HOTSPOTS_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Location intelligence</p>
          <h2>Neighborhood Hotspots</h2>
        </div>
      </div>

      {loading ? <div className="panel-loading">Loading hotspot data...</div> : null}

      {error ? <div className="panel-error">{error.message}</div> : null}

      {!loading && !error && (!data?.neighborhoodHotspots || data.neighborhoodHotspots.length === 0) ? (
        <div className="panel-empty">No hotspot data is available yet.</div>
      ) : null}

      {!loading && !error && data?.neighborhoodHotspots?.length > 0 ? (
        <div className="data-list">
          {data.neighborhoodHotspots.map((item, index) => (
            <div className="data-row" key={`${item.neighborhood}-${index}`}>
              <div>
                <strong>{item.neighborhood}</strong>
              </div>
              <span className="data-badge">{item.count}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}