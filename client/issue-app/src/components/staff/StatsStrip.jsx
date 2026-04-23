export default function StatsStrip({ issues }) {
  const list = Array.isArray(issues) ? issues : []

  const openStatuses = ['reported', 'under_review', 'assigned']
  const openCount = list.filter((issue) => openStatuses.includes(issue.status)).length
  const inProgressCount = list.filter((issue) => issue.status === 'in_progress').length
  const urgentCount = list.filter((issue) => issue.urgentAlert).length
  const resolvedCount = list.filter(
    (issue) => issue.status === 'resolved' || issue.status === 'closed',
  ).length

  return (
    <div className="staff-stats">
      <div className="staff-stat staff-stat--open">
        <span className="staff-stat__label">Open</span>
        <span className="staff-stat__value">{openCount}</span>
        <span className="staff-stat__delta">awaiting action</span>
      </div>

      <div className="staff-stat staff-stat--progress">
        <span className="staff-stat__label">In progress</span>
        <span className="staff-stat__value">{inProgressCount}</span>
        <span className="staff-stat__delta">being worked on</span>
      </div>

      <div className="staff-stat staff-stat--urgent">
        <span className="staff-stat__label">Urgent</span>
        <span className="staff-stat__value">{urgentCount}</span>
        <span className="staff-stat__delta">flagged for priority</span>
      </div>

      <div className="staff-stat staff-stat--resolved">
        <span className="staff-stat__label">Resolved</span>
        <span className="staff-stat__value">{resolvedCount}</span>
        <span className="staff-stat__delta">closed cases</span>
      </div>
    </div>
  )
}
