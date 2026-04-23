import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { MY_ISSUES } from '../../graphql/queries/issueQueries'
import {
  formatLabel,
  statusToneClass,
  priorityToneClass,
} from '../../utils/issueEnums'
import formatDate from '../../utils/formatDate'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import EmptyState from '../../components/common/EmptyState'

export default function MyIssuesPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')

  const { data, loading, error } = useQuery(MY_ISSUES, {
    fetchPolicy: 'network-only',
  })

  const issues = useMemo(
    () => (Array.isArray(data?.myIssues) ? data.myIssues : []),
    [data],
  )

  const stats = useMemo(
    () => ({
      total: issues.length,
      reported: issues.filter((i) => i.status === 'reported').length,
      inProgress: issues.filter((i) => i.status === 'in_progress').length,
      resolved: issues.filter((i) => i.status === 'resolved').length,
    }),
    [issues],
  )

  const presentStatuses = useMemo(() => {
    const seen = new Set()
    issues.forEach((i) => {
      if (i.status) seen.add(i.status)
    })
    return Array.from(seen)
  }, [issues])

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'all') return issues
    return issues.filter((i) => i.status === activeFilter)
  }, [issues, activeFilter])

  if (loading) {
    return <LoadingSpinner text="Loading your issues..." />
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  if (!issues.length) {
    return (
      <EmptyState
        title="No issues found"
        subtitle="You have not reported any issues yet."
      />
    )
  }

  return (
    <div className="staff-main staff-detail-page">
      <div className="staff-page-header">
        <div className="staff-page-header__title-group">
          <h1 className="staff-page-header__title">My issues</h1>
          <span className="staff-page-header__subtitle">
            Track the issues you have reported.
          </span>
        </div>
      </div>

      <div className="staff-stats">
        <div className="staff-stat">
          <span className="staff-stat__label">Total</span>
          <span className="staff-stat__value">{stats.total}</span>
        </div>
        <div className="staff-stat staff-stat--open">
          <span className="staff-stat__label">Reported</span>
          <span className="staff-stat__value">{stats.reported}</span>
        </div>
        <div className="staff-stat staff-stat--progress">
          <span className="staff-stat__label">In progress</span>
          <span className="staff-stat__value">{stats.inProgress}</span>
        </div>
        <div className="staff-stat staff-stat--resolved">
          <span className="staff-stat__label">Resolved</span>
          <span className="staff-stat__value">{stats.resolved}</span>
        </div>
      </div>

      <div className="staff-filter-chips" role="tablist" aria-label="Filter issues by status">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'all'}
          className={`staff-filter-chip ${activeFilter === 'all' ? 'staff-filter-chip--active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All <span className="staff-filter-chip__count">{stats.total}</span>
        </button>
        {presentStatuses.map((status) => {
          const count = issues.filter((i) => i.status === status).length
          const isActive = activeFilter === status
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`staff-filter-chip ${isActive ? 'staff-filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(status)}
            >
              {formatLabel(status)} <span className="staff-filter-chip__count">{count}</span>
            </button>
          )
        })}
      </div>

      {filteredIssues.length === 0 ? (
        <div className="staff-empty">
          <span className="staff-empty__title">No issues match this filter</span>
          You can clear the filter to see everything again.
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              className="staff-btn staff-btn--ghost"
              onClick={() => setActiveFilter('all')}
            >
              Show all
            </button>
          </div>
        </div>
      ) : (
        <div className="issue-grid">
          {filteredIssues.map((issue) => (
            <IssueGridCard
              key={issue.id}
              issue={issue}
              onOpen={() => navigate(`/issues/${issue.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function IssueGridCard({ issue, onOpen }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <article
      className="issue-grid-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Open issue ${issue.title}`}
    >
      <div className="issue-grid-card__media">
        {issue.photoUrl ? (
          <img src={issue.photoUrl} alt={issue.title} loading="lazy" />
        ) : (
          <div className="issue-grid-card__media-empty" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {issue.urgentAlert && (
          <span className="issue-grid-card__urgent">Urgent</span>
        )}
      </div>

      <div className="issue-grid-card__body">
        <h3 className="issue-grid-card__title">{issue.title}</h3>

        <div className="issue-grid-card__chips">
          <span className={`staff-chip ${statusToneClass(issue.status)}`}>
            {formatLabel(issue.status)}
          </span>
          <span className={`staff-chip ${priorityToneClass(issue.priority)}`}>
            {formatLabel(issue.priority)}
          </span>
          <span className="staff-chip staff-chip--no-dot tone-slate">
            {formatLabel(issue.category)}
          </span>
        </div>

        {issue.description && (
          <p className="issue-grid-card__description">{issue.description}</p>
        )}

        <div className="issue-grid-card__footer">
          <span className="issue-grid-card__meta">
            {issue.location?.neighborhood
              || issue.location?.address
              || 'No location provided'}
          </span>
          <span className="issue-grid-card__meta">{formatDate(issue.createdAt)}</span>
        </div>
      </div>
    </article>
  )
}
