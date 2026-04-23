import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { CURRENT_USER_QUERY } from '../graphql/queries'
import { getInitials, roleClass } from '../utils/format'
import CommunitySummaryCard from './CommunitySummaryCard.jsx'
import IssueContextHeader from './IssueContextHeader.jsx'
import UpvoteControl from './UpvoteControl.jsx'
import CommentsPanel from './CommentsPanel.jsx'
import VolunteerInterestPanel from './VolunteerInterestPanel.jsx'
import IssueBrowseGrid from './IssueBrowseGrid.jsx'

// The CommunityApp component is the main entry point for the community engagement features. It manages the state of the selected issue and fetches the current user if not provided as a prop.
export default function CommunityApp({ issueId: issueIdProp, currentUser: currentUserProp }) {
  const [selectedIssueId, setSelectedIssueId] = useState(issueIdProp || null)

  useEffect(() => {
    if (issueIdProp) {
      setSelectedIssueId(issueIdProp)
    }
  }, [issueIdProp])

  const { data, loading } = useQuery(CURRENT_USER_QUERY, {
    skip: Boolean(currentUserProp),
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const currentUser = currentUserProp || data?.currentUser || null
  const embedded = Boolean(currentUserProp)

  if (loading && !currentUser) {
    return (
      <main className="shell">
        <p className="loading-prose">Loading</p>
      </main>
    )
  }

  // If the user is not authenticated, show a message prompting them to sign in through the authentication app before engaging with community features.
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

  // If no specific issue is selected, show the grid of community issues. 
  if (!selectedIssueId) {
    return (
      <>
        {!embedded && <Navbar currentUser={currentUser} />}
        <main className="shell">
          <IssueBrowseGrid
            currentUser={currentUser}
            onSelectIssue={(id) => setSelectedIssueId(id)}
          />
        </main>
      </>
    )
  }

  return (
    <>
      {!embedded && <Navbar currentUser={currentUser} />}
      <main className="shell fade-in">
        <div className="change-issue-bar">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setSelectedIssueId(null)}
          >
            &larr; Back to all community issues
          </button>
        </div>
        <IssueContextHeader issueId={selectedIssueId} />
        <CommunitySummaryCard issueId={selectedIssueId} />
        <div className="layout">
          <aside className="layout__sidebar">
            <UpvoteControl issueId={selectedIssueId} currentUser={currentUser} />
            <VolunteerInterestPanel issueId={selectedIssueId} currentUser={currentUser} />
          </aside>
          <section className="layout__main">
            <CommentsPanel issueId={selectedIssueId} currentUser={currentUser} />
          </section>
        </div>
      </main>
    </>
  )
}

// The Navbar component displays the application title and the current user's name and role.
function Navbar({ currentUser }) {
  return (
    <nav className="navbar" aria-label="Primary">
      <div className="navbar__stripe" aria-hidden="true" />
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__mark" aria-hidden="true" />
          <div className="navbar__wordmark">
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
