import { useNavigate } from 'react-router-dom'
import formatDate from '../../utils/formatDate'
import {
  formatLabel,
  statusToneClass,
  priorityToneClass,
} from '../../utils/issueEnums'

export default function IssueTable({ issues }) {
  const navigate = useNavigate()

  if (!issues.length) {
    return (
      <div className="staff-empty">
        <span className="staff-empty__title">No issues match these filters</span>
        Adjust your search or clear filters to see more results.
      </div>
    )
  }

  const handleOpen = (issueId) => {
    navigate(`/issues/${issueId}`)
  }

  return (
    <div className="staff-table" role="table" aria-label="Issues">
      <div className="staff-table__header" role="row">
        <span aria-hidden="true" />
        <span role="columnheader">Issue</span>
        <span role="columnheader">Location</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Priority</span>
        <span role="columnheader">Reported</span>
        <span aria-hidden="true" />
      </div>

      {issues.map((issue) => {
        const location =
          issue.location?.neighborhood ||
          issue.location?.address ||
          'No location set'

        return (
          <div
            key={issue.id}
            role="row"
            tabIndex={0}
            className={`staff-table__row ${issue.urgentAlert ? 'staff-table__row--urgent' : ''}`}
            onClick={() => handleOpen(issue.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleOpen(issue.id)
              }
            }}
          >
            <span
              className="staff-table__urgent-flag"
              data-active={issue.urgentAlert ? 'true' : 'false'}
              aria-label={issue.urgentAlert ? 'Urgent issue' : 'Not flagged urgent'}
              title={issue.urgentAlert ? 'Urgent' : 'Not urgent'}
            >
              {issue.urgentAlert ? '!' : ''}
            </span>

            <div>
              <div className="staff-table__title">{issue.title}</div>
              <div className="staff-table__subtitle">
                {formatLabel(issue.category)} &middot; Reported by {issue.reportedByUsername}
              </div>
            </div>

            <div className="staff-table__location" title={location}>
              {location}
            </div>

            <span className={`staff-chip ${statusToneClass(issue.status)}`}>
              {formatLabel(issue.status)}
            </span>

            <span className={`staff-chip ${priorityToneClass(issue.priority)}`}>
              {formatLabel(issue.priority)}
            </span>

            <span className="staff-table__date">{formatDate(issue.createdAt)}</span>

            <span className="staff-table__chevron" aria-hidden="true">
              &rsaquo;
            </span>
          </div>
        )
      })}
    </div>
  )
}
