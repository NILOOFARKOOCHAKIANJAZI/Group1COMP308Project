import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import { ISSUE_BY_ID } from '../../graphql/queries/issueQueries'
import { CURRENT_USER_QUERY } from '../../graphql/queries/userQueries'
import formatDate from '../../utils/formatDate'
import {
  formatLabel,
  statusToneClass,
  priorityToneClass,
} from '../../utils/issueEnums'
import StaffControlsPanel from '../../components/staff/StaffControlsPanel'

const PRIVILEGED_ROLES = ['staff', 'advocate']
const SELECTED_ISSUE_STORAGE_KEY = 'shell_selected_issue_id'
const ISSUE_SELECTED_EVENT = 'civiccase-issue-selected'

export default function IssueDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, loading, error } = useQuery(ISSUE_BY_ID, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  })

  const { data: userData } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'cache-first',
  })

  const currentUser = userData?.currentUser
  const isStaff = PRIVILEGED_ROLES.includes(currentUser?.role)
  const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (loading && !data) {
    return (
      <div className="staff-main staff-detail-page">
        <div className="staff-loading">Loading issue details</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="staff-main staff-detail-page">
        <div className="staff-message staff-message--error">
          {error.message || 'Unable to load this issue.'}
        </div>
      </div>
    )
  }

  const issue = data?.issueById
  if (!issue) {
    return (
      <div className="staff-main staff-detail-page">
        <div className="staff-empty">
          <span className="staff-empty__title">Issue not found</span>
          It may have been deleted or the link is incorrect.
        </div>
      </div>
    )
  }

  const backDestination = isStaff ? '/staff/dashboard' : '/my-issues'

  const handleOpenInCommunity = () => {
    try {
      localStorage.setItem(SELECTED_ISSUE_STORAGE_KEY, issue.id)
    } catch {
      // Storage may be unavailable in private modes; the event still propagates.
    }

    window.dispatchEvent(
      new CustomEvent(ISSUE_SELECTED_EVENT, { detail: { issueId: issue.id } }),
    )

    window.location.hash = '#community'
  }

  const photoCard = (
    <PhotoCard photoUrl={issue.photoUrl} title={issue.title} />
  )

  const mapCard = (
    <MapCard
      latitude={issue.location?.latitude}
      longitude={issue.location?.longitude}
      address={issue.location?.address}
    />
  )

  return (
    <APIProvider apiKey={mapApiKey || ''}>
      <div className="staff-main staff-detail-page">
        <div className="staff-detail-toolbar">
          <button
            type="button"
            className="staff-back-link"
            onClick={() => navigate(backDestination)}
          >
            &larr; Back to {isStaff ? 'dashboard' : 'my issues'}
          </button>

          <button
            type="button"
            className="staff-btn staff-btn--accent"
            onClick={handleOpenInCommunity}
          >
            Open community discussion
          </button>
        </div>

        <div className="staff-details-layout">
          <div className="staff-details-main">
            <IssueHero issue={issue} />
            <IssueInfoGrid issue={issue} />

            {isStaff && (
              <div className="staff-detail-media-row">
                {photoCard}
                {mapCard}
              </div>
            )}

            {issue.internalNotes && isStaff && (
              <InternalNotesPanel notes={issue.internalNotes} />
            )}
          </div>

          <aside className="staff-details-sidebar">
            {isStaff && (
              <StaffControlsPanel issue={issue} currentUser={currentUser} />
            )}

            {!isStaff && photoCard}
            {!isStaff && mapCard}

            {issue.aiSummary && (
              <AiInsightCard summary={issue.aiSummary} aiCategory={issue.aiCategory} />
            )}
          </aside>
        </div>
      </div>
    </APIProvider>
  )
}

function IssueHero({ issue }) {
  return (
    <section className={`staff-detail-hero ${issue.urgentAlert ? 'staff-detail-hero--urgent' : ''}`}>
      <div className="staff-detail-hero__header">
        <div className="staff-detail-hero__title-block">
          <h1 className="staff-detail-hero__title">{issue.title}</h1>
          <div className="staff-detail-hero__meta-row">
            <span className={`staff-chip ${statusToneClass(issue.status)}`}>
              {formatLabel(issue.status)}
            </span>
            <span className={`staff-chip ${priorityToneClass(issue.priority)}`}>
              {formatLabel(issue.priority)} priority
            </span>
            <span className="staff-chip staff-chip--no-dot tone-slate">
              {formatLabel(issue.category)}
            </span>
            {issue.urgentAlert && (
              <span className="staff-chip tone-red">Urgent</span>
            )}
          </div>
        </div>
      </div>

      {issue.description && (
        <p className="staff-detail-hero__description">{issue.description}</p>
      )}
    </section>
  )
}

function IssueInfoGrid({ issue }) {
  const cells = [
    { label: 'Reported by', value: issue.reportedByUsername },
    {
      label: 'Assigned to',
      value: issue.assignedToUsername || 'Not assigned',
      muted: !issue.assignedToUsername,
    },
    { label: 'Category', value: formatLabel(issue.category) },
    {
      label: 'AI category',
      value: formatLabel(issue.aiCategory) || 'Not classified',
      muted: !issue.aiCategory,
    },
    {
      label: 'Address',
      value: issue.location?.address || 'Not provided',
      muted: !issue.location?.address,
    },
    {
      label: 'Neighborhood',
      value: issue.location?.neighborhood || 'Not provided',
      muted: !issue.location?.neighborhood,
    },
    {
      label: 'Coordinates',
      value:
        issue.location?.latitude && issue.location?.longitude
          ? `${issue.location.latitude.toFixed(4)}, ${issue.location.longitude.toFixed(4)}`
          : 'Not provided',
      muted: !issue.location?.latitude,
    },
    { label: 'Reported on', value: formatDate(issue.createdAt) },
    { label: 'Last updated', value: formatDate(issue.updatedAt) },
  ]

  return (
    <section className="staff-card">
      <div className="staff-card__head">
        <div className="staff-card__title">Issue details</div>
      </div>
      <div className="staff-card__body">
        <div className="staff-info-grid">
          {cells.map((cell) => (
            <div className="staff-info-cell" key={cell.label}>
              <div className="staff-info-cell__label">{cell.label}</div>
              <div
                className={`staff-info-cell__value ${cell.muted ? 'staff-info-cell__value--muted' : ''}`}
              >
                {cell.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AiInsightCard({ summary, aiCategory }) {
  return (
    <section className="ai-insight-card">
      <div className="ai-insight-card__head">
        <div className="ai-insight-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
            <path d="M5 17l.7 1.8 1.8.7-1.8.7L5 22l-.7-1.8-1.8-.7 1.8-.7L5 17z" opacity="0.55" />
            <path d="M19 14l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4z" opacity="0.55" />
          </svg>
        </div>
        <div className="ai-insight-card__heading">
          <div className="ai-insight-card__title">Gemini AI Analysis</div>
          <div className="ai-insight-card__subtitle">Automated triage</div>
        </div>
      </div>

      <p className="ai-insight-card__body">{summary}</p>

      {aiCategory && (
        <div className="ai-insight-card__footer">
          <div className="ai-insight-card__footer-row">
            <span className="ai-insight-card__footer-label">Detected category</span>
            <span className="ai-insight-card__footer-value">{formatLabel(aiCategory)}</span>
          </div>
        </div>
      )}

      <div className="ai-insight-card__brand">Powered by Gemini</div>
    </section>
  )
}

function PhotoCard({ photoUrl, title }) {
  return (
    <section className="staff-card detail-side-card">
      <div className="staff-card__head">
        <div className="staff-card__title">Photo</div>
      </div>
      {photoUrl ? (
        <div className="detail-side-card__media">
          <img src={photoUrl} alt={title} loading="lazy" />
        </div>
      ) : (
        <div className="detail-side-card__empty">
          <div className="detail-side-card__empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div className="detail-side-card__empty-title">No image uploaded</div>
          <div className="detail-side-card__empty-text">A photo helps staff verify and triage faster.</div>
        </div>
      )}
    </section>
  )
}

function MapCard({ latitude, longitude, address }) {
  const hasCoords = latitude != null && longitude != null

  return (
    <section className="staff-card detail-side-card">
      <div className="staff-card__head">
        <div className="staff-card__title">Location</div>
      </div>
      {hasCoords ? (
        <>
          <div className="detail-side-card__map">
            <Map
              style={{ width: '100%', height: '100%' }}
              center={{ lat: latitude, lng: longitude }}
              zoom={15}
              gestureHandling="none"
              disableDefaultUI
              clickableIcons={false}
            >
              <Marker position={{ lat: latitude, lng: longitude }} />
            </Map>
          </div>
          {address && (
            <div className="detail-side-card__caption">{address}</div>
          )}
        </>
      ) : (
        <div className="detail-side-card__empty">
          <div className="detail-side-card__empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="detail-side-card__empty-title">No location pin</div>
          <div className="detail-side-card__empty-text">This issue was submitted without coordinates.</div>
        </div>
      )}
    </section>
  )
}

function InternalNotesPanel({ notes }) {
  return (
    <section className="staff-card">
      <div className="staff-card__head">
        <div className="staff-card__title">Internal notes</div>
      </div>
      <div className="staff-card__body">
        <p className="staff-card__notes">{notes}</p>
      </div>
    </section>
  )
}
