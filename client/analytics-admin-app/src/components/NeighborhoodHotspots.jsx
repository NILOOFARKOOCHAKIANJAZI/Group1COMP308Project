import { useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { NEIGHBORHOOD_HOTSPOTS_QUERY } from '../graphql/queries'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      style={{
        background: '#0f172a',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.18)',
      }}
    >
      {item.payload.neighborhood}: {item.value}
    </div>
  )
}

export default function NeighborhoodHotspots() {
  const { data, loading, error } = useQuery(NEIGHBORHOOD_HOTSPOTS_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const items = useMemo(() => {
    return (data?.neighborhoodHotspots || [])
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [data])

  return (
    <section className="aa-card">
      <div className="aa-card__head">
        <div className="aa-card__head-text">
          <span className="aa-card__eyebrow">Location intelligence</span>
          <span className="aa-card__title">Neighborhood hotspots</span>
        </div>
      </div>

      <div className="aa-card__body">
        {loading ? (
          <div className="aa-state">Loading hotspot data...</div>
        ) : error ? (
          <div className="aa-state aa-state--error">{error.message}</div>
        ) : items.length === 0 ? (
          <div className="aa-state">No hotspot data is available yet.</div>
        ) : (
          <div className="aa-chart-wrap">
            <ResponsiveContainer width="100%" height={Math.max(220, items.length * 40)}>
              <BarChart
                data={items}
                layout="vertical"
                margin={{ top: 8, right: 28, bottom: 8, left: 8 }}
              >
                <CartesianGrid horizontal={false} stroke="#e4e9f0" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="neighborhood"
                  stroke="#475569"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'rgba(15, 40, 71, 0.06)' }}
                />
                <Bar
                  dataKey="count"
                  fill="#0f2847"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  )
}
