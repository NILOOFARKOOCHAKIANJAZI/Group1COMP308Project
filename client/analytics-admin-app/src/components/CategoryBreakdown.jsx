import { useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ISSUES_BY_CATEGORY_QUERY } from '../graphql/queries'

const CATEGORY_COLORS = {
  pothole: '#d15722',
  broken_streetlight: '#2563eb',
  flooding: '#0891b2',
  sidewalk_damage: '#b26b00',
  garbage: '#059669',
  graffiti: '#7c3aed',
  traffic_signal: '#f59e0b',
  safety_hazard: '#dc2626',
  other: '#64748b',
}

const FALLBACK_COLOR = '#94a3b8'

function formatCategory(value) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

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
      {formatCategory(item.payload.category)}: {item.value}
    </div>
  )
}

export default function CategoryBreakdown() {
  const { data, loading, error } = useQuery(ISSUES_BY_CATEGORY_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const items = useMemo(() => {
    return (data?.issuesByCategory || [])
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [data])

  return (
    <section className="aa-card">
      <div className="aa-card__head">
        <div className="aa-card__head-text">
          <span className="aa-card__eyebrow">Issue mix</span>
          <span className="aa-card__title">Category breakdown</span>
        </div>
      </div>

      <div className="aa-card__body">
        {loading ? (
          <div className="aa-state">Loading issue categories...</div>
        ) : error ? (
          <div className="aa-state aa-state--error">{error.message}</div>
        ) : items.length === 0 ? (
          <div className="aa-state">No categorized issue data is available yet.</div>
        ) : (
          <div className="aa-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={items}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {items.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] || FALLBACK_COLOR}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!loading && !error && items.length > 0 && (
        <div className="aa-pie-legend">
          {items.map((item) => (
            <div className="aa-pie-legend__item" key={item.category}>
              <span
                className="aa-pie-legend__swatch"
                style={{ background: CATEGORY_COLORS[item.category] || FALLBACK_COLOR }}
              />
              <span className="aa-pie-legend__label">{formatCategory(item.category)}</span>
              <span className="aa-pie-legend__count">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
