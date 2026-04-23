import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import {
  ALL_ISSUES_QUERY,
  COMMUNITY_SUMMARY_QUERY,
  MY_ISSUES_QUERY,
} from '../graphql/queries'
import { isPrivileged, formatRelativeOrDate } from '../utils/format'

const STATUS_TONE = {
  reported: 'tone-blue',
  under_review: 'tone-blue',
  assigned: 'tone-blue',
  in_progress: 'tone-amber',
  resolved: 'tone-green',
  closed: 'tone-green',
}

function formatLabel(value) {
  if (!value) return ''
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function IssueBrowseGrid({ currentUser, onSelectIssue }) {
  const staffOrAdvocate = isPrivileged(currentUser)
  const queryToUse = staffOrAdvocate ? ALL_ISSUES_QUERY : MY_ISSUES_QUERY

  const { data, loading, error } = useQuery(queryToUse, {
    fetchPolicy: 'cache-and-network',
  })

  const [activeFilter, setActiveFilter] = useState('all')

  const issues = useMemo(() => {
    const list = staffOrAdvocate ? data?.allIssues : data?.myIssues
    return Array.isArray(list) ? list : []
  }, [data, staffOrAdvocate])

  const presentStatuses = useMemo(() => {
    const seen = new Set()
    issues.forEach((issue) => {
      if (issue.status) seen.add(issue.status)
    })
    return Array.from(seen)
  }, [issues])

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'all') return issues
    if (activeFilter === 'urgent') return issues.filter((i) => i.urgentAlert)
    return issues.filter((i) => i.status === activeFilter)
  }, [issues, activeFilter])

  const urgentCount = useMemo(
    () => issues.filter((i) => i.urgentAlert).length,
    [issues],
  )

  if (loading && !data) {
    return <p className="loading-prose">Loading community issues</p>
  }

  if (error) {
    return (
      <div className="alert alert--warning" role="alert">
        Failed to load community issues. {error.message}
      </div>
    )
  }

  if (issues.length === 0) {
    return (
      <section className="state-card fade-in">
        <p className="state-card__eyebrow">Community</p>
        <h2 className="state-card__title">
          {staffOrAdvocate
            ? 'No community issues yet'
            : 'You have not reported any issues yet'}
        </h2>
        <p className="state-card__body">
          {staffOrAdvocate
            ? 'Once residents report issues they will appear here for engagement.'
            : 'Submit a report from the Issue tab and your conversation will appear here.'}
        </p>
      </section>
    )
  }

  return (
    <div className="browse fade-in">
      <header className="browse__header">
        <p className="browse__eyebrow">{staffOrAdvocate ? 'All neighborhoods' : 'Your conversations'}</p>
        <h2 className="browse__title">
          {staffOrAdvocate ? 'Community issues' : 'Your community discussions'}
        </h2>
        <p className="browse__subtitle">
          {staffOrAdvocate
            ? 'Browse every reported issue and step into the conversation.'
            : 'Pick one of your reports to see comments, upvotes, and volunteer interest.'}
        </p>
      </header>

      <div className="browse__filters" role="tablist" aria-label="Filter issues">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'all'}
          className={`browse-chip ${activeFilter === 'all' ? 'browse-chip--active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All <span className="browse-chip__count">{issues.length}</span>
        </button>
        {urgentCount > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'urgent'}
            className={`browse-chip browse-chip--urgent ${activeFilter === 'urgent' ? 'browse-chip--active' : ''}`}
            onClick={() => setActiveFilter('urgent')}
          >
            Urgent <span className="browse-chip__count">{urgentCount}</span>
          </button>
        )}
        {presentStatuses.map((status) => {
          const count = issues.filter((i) => i.status === status).length
          const isActive = activeFilter === status
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`browse-chip ${isActive ? 'browse-chip--active' : ''}`}
              onClick={() => setActiveFilter(status)}
            >
              {formatLabel(status)} <span className="browse-chip__count">{count}</span>
            </button>
          )
        })}
      </div>

      {filteredIssues.length === 0 ? (
        <div className="state-card">
          <p className="state-card__eyebrow">No matches</p>
          <h2 className="state-card__title">No issues match this filter</h2>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setActiveFilter('all')}
            style={{ marginTop: 14 }}
          >
            Show all
          </button>
        </div>
      ) : (
        <div className="browse__grid">
          {filteredIssues.map((issue) => (
            <IssueBrowseCard
              key={issue.id}
              issue={issue}
              onSelect={onSelectIssue}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function IssueBrowseCard({ issue, onSelect }) {
  const { data } = useQuery(COMMUNITY_SUMMARY_QUERY, {
    variables: { issueId: issue.id },
    fetchPolicy: 'cache-and-network',
  })

  const summary = data?.communitySummary
  const totalComments = summary?.totalComments ?? 0
  const totalUpvotes = summary?.totalUpvotes ?? 0
  const totalVolunteers = summary?.totalVolunteers ?? 0
  const statusTone = STATUS_TONE[issue.status] || 'tone-blue'

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(issue.id)
    }
  }

  return (
    <article
      className="browse-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(issue.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Open community discussion for ${issue.title}`}
    >
      <div className="browse-card__media">
        {issue.photoUrl ? (
          <img src={issue.photoUrl} alt={issue.title} loading="lazy" />
        ) : (
          <div className="browse-card__media-empty" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {issue.urgentAlert && (
          <span className="browse-card__urgent-flag">Urgent</span>
        )}
      </div>

      <div className="browse-card__body">
        <h3 className="browse-card__title">{issue.title}</h3>

        <div className="browse-card__chips">
          <span className={`browse-card__chip browse-card__chip--${statusTone}`}>
            {formatLabel(issue.status)}
          </span>
          <span className="browse-card__chip browse-card__chip--neutral">
            {formatLabel(issue.category)}
          </span>
        </div>

        {issue.description && (
          <p className="browse-card__description">{issue.description}</p>
        )}

        <div className="browse-card__meta">
          <span className="browse-card__meta-item">
            {issue.location?.neighborhood
              || issue.location?.address
              || 'No location'}
          </span>
          <span className="browse-card__meta-item">
            Reported by {issue.reportedByUsername}
          </span>
          <span className="browse-card__meta-item">
            {formatRelativeOrDate(issue.createdAt)}
          </span>
        </div>

        <div className="browse-card__engagement">
          <EngagementMetric label="Comments" value={totalComments} tone="primary" />
          <EngagementMetric label="Upvotes" value={totalUpvotes} tone="accent" />
          <EngagementMetric label="Volunteers" value={totalVolunteers} tone="success" />
        </div>
      </div>
    </article>
  )
}

function EngagementMetric({ label, value, tone }) {
  return (
    <div className={`engagement-metric engagement-metric--${tone}`}>
      <span className="engagement-metric__value">{value}</span>
      <span className="engagement-metric__label">{label}</span>
    </div>
  )
}
