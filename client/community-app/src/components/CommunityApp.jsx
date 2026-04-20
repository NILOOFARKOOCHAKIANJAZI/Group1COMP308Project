import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { CURRENT_USER_QUERY } from '../graphql/queries'
import { getInitials, roleClass } from '../utils/format'
import CommunitySummaryCard from './CommunitySummaryCard.jsx'
import UpvoteControl from './UpvoteControl.jsx'
import CommentsPanel from './CommentsPanel.jsx'
import VolunteerInterestPanel from './VolunteerInterestPanel.jsx'

export default function CommunityApp({ issueId: issueIdProp, currentUser: currentUserProp }) {
  const [manualIssueId, setManualIssueId] = useState('')
  const [submittedIssueId, setSubmittedIssueId] = useState(null)

  const { data, loading } = useQuery(CURRENT_USER_QUERY, {
    skip: Boolean(currentUserProp),
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const currentUser = currentUserProp || data?.currentUser || null
  const activeIssueId = issueIdProp || submittedIssueId
  const embedded = Boolean(currentUserProp)

  if (loading && !currentUser) {
    return (
      <main className="shell">
        <p className="loading-prose">Loading</p>
      </main>
    )
  }

  if (!currentUser) {
    return (
      <main className="shell">
        <section className="state-card fade-in" aria-labelledby="auth-required-title">
          <p className="state-card__eyebrow">Access</p>
          <h2 id="auth-required-title" className="state-card__title">
            Sign-in required
          </h2>
          <p className="state-card__body">
            Please sign in through the authentication app before engaging with community features.
          </p>
        </section>
      </main>
    )
  }

  if (!activeIssueId) {
    return (
      <>
        {!embedded && <Navbar currentUser={currentUser} />}
        <main className="shell">
          <IssueIdPrompt
            value={manualIssueId}
            onChange={setManualIssueId}
            onSubmit={() => {
              const trimmed = manualIssueId.trim()
              if (trimmed) {
                setSubmittedIssueId(trimmed)
              }
            }}
          />
        </main>
      </>
    )
  }

  return (
    <>
      {!embedded && <Navbar currentUser={currentUser} />}
      <main className="shell fade-in">
        {!issueIdProp && (
          <div className="change-issue-bar">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setSubmittedIssueId(null)
                setManualIssueId('')
              }}
            >
              Change issue
            </button>
          </div>
        )}
        <CommunitySummaryCard issueId={activeIssueId} />
        <div className="layout">
          <aside className="layout__sidebar">
            <UpvoteControl issueId={activeIssueId} currentUser={currentUser} />
            <VolunteerInterestPanel issueId={activeIssueId} currentUser={currentUser} />
          </aside>
          <section className="layout__main">
            <CommentsPanel issueId={activeIssueId} currentUser={currentUser} />
          </section>
        </div>
      </main>
    </>
  )
}

function Navbar({ currentUser }) {
  return (
    <nav className="navbar" aria-label="Primary">
      <div className="navbar__stripe" aria-hidden="true" />
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__mark" aria-hidden="true" />
          <div className="navbar__wordmark">
            <span className="navbar__eyebrow">CivicCase</span>
            <span className="navbar__title">Community Engagement</span>
          </div>
        </div>
        <div className="navbar__actions">
          <div className="user-chip">
            <div
              className={`avatar ${roleClass('avatar', currentUser.role)}`}
              aria-hidden="true"
            >
              {getInitials(currentUser.fullName || currentUser.username)}
            </div>
            <div className="user-chip__meta">
              <div className="user-chip__name">{currentUser.fullName}</div>
              <span className={`role-pill ${roleClass('role-pill', currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function IssueIdPrompt({ value, onChange, onSubmit }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="intro-panel fade-in" aria-labelledby="issue-id-prompt-title">
      <p className="intro-panel__eyebrow">Get started</p>
      <h2 id="issue-id-prompt-title" className="intro-panel__title">
        Select an issue to engage with
      </h2>
      <p className="intro-panel__description">
        When embedded in the shell app, the issue is passed automatically. For standalone testing, paste an issue ID below.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="manual-issue-id" className="label">
          Issue ID
        </label>
        <div className="input-group">
          <input
            id="manual-issue-id"
            type="text"
            className="input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Paste the issue identifier"
            required
          />
          <button type="submit" className="btn">
            Load
          </button>
        </div>
      </form>
    </section>
  )
}
