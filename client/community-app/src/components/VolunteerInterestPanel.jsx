import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import {
  VOLUNTEER_INTERESTS_BY_ISSUE_QUERY,
  MY_VOLUNTEER_INTERESTS_QUERY,
  COMMUNITY_SUMMARY_QUERY,
} from '../graphql/queries'
import {
  EXPRESS_VOLUNTEER_INTEREST_MUTATION,
  UPDATE_VOLUNTEER_STATUS_MUTATION,
} from '../graphql/mutations'
import {
  getInitials,
  statusClass,
  formatDateTime,
  isPrivileged,
} from '../utils/format'

const STATUS_OPTIONS = ['interested', 'contacted', 'matched', 'closed']
const MAX_MESSAGE_LENGTH = 1000

export default function VolunteerInterestPanel({ issueId, currentUser }) {
  if (isPrivileged(currentUser)) {
    return <VolunteerManagementView issueId={issueId} />
  }

  return <VolunteerResidentView issueId={issueId} currentUser={currentUser} />
}

function VolunteerResidentView({ issueId, currentUser }) {
  const { data, loading } = useQuery(MY_VOLUNTEER_INTERESTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  const myInterests = data?.myVolunteerInterests ?? []
  const existingInterest = myInterests.find((interest) => interest.issueId === issueId)

  return (
    <section className="card" aria-labelledby="volunteer-title">
      <div className="card__header">
        <div className="card__header-body">
          <h2 id="volunteer-title" className="card__title">
            Step up to help
          </h2>
          <p className="card__subtitle">
            Offer your time. Staff will coordinate from there.
          </p>
        </div>
      </div>
      <div className="card__body">
        {loading && !data && <p className="loading-prose">Loading status</p>}
        {!loading && existingInterest && <ExistingInterest interest={existingInterest} />}
        {!loading && !existingInterest && (
          <VolunteerInterestForm issueId={issueId} currentUser={currentUser} />
        )}
      </div>
    </section>
  )
}

function ExistingInterest({ interest }) {
  return (
    <div className="volunteer-status-card fade-in">
      <p className="volunteer-status-card__heading">
        Thanks for offering. Your interest is on the record.
      </p>
      <div className="volunteer-status-card__row">
        <span className="volunteer-status-card__label">Status</span>
        <span className={`status-pill ${statusClass('status-pill', interest.status)}`}>
          {interest.status}
        </span>
      </div>
      {interest.message && (
        <>
          <div className="volunteer-status-card__label">Your message</div>
          <div className="volunteer-status-card__message">{interest.message}</div>
        </>
      )}
    </div>
  )
}

function VolunteerInterestForm({ issueId, currentUser }) {
  const [fullName, setFullName] = useState(currentUser.fullName || '')
  const [contactEmail, setContactEmail] = useState(currentUser.email || '')
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')

  const [expressInterest, { loading }] = useMutation(EXPRESS_VOLUNTEER_INTEREST_MUTATION, {
    refetchQueries: [
      { query: MY_VOLUNTEER_INTERESTS_QUERY },
      { query: COMMUNITY_SUMMARY_QUERY, variables: { issueId } },
    ],
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    try {
      const result = await expressInterest({
        variables: {
          input: {
            issueId,
            fullName: fullName.trim(),
            contactEmail: contactEmail.trim(),
            message: message.trim(),
          },
        },
      })
      const payload = result.data?.expressVolunteerInterest
      if (!payload?.success) {
        setFormError(payload?.message || 'Failed to submit volunteer interest.')
      }
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="volunteer-fullname" className="label">
          Full name
        </label>
        <input
          id="volunteer-fullname"
          type="text"
          className="input"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div className="field">
        <label htmlFor="volunteer-email" className="label">
          Contact email
        </label>
        <input
          id="volunteer-email"
          type="email"
          className="input"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="field">
        <label htmlFor="volunteer-message" className="label">
          Message (optional)
        </label>
        <textarea
          id="volunteer-message"
          className="textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          maxLength={MAX_MESSAGE_LENGTH}
          aria-describedby="volunteer-message-help"
          placeholder="Any skills, availability, or ideas to share?"
        />
        <span id="volunteer-message-help" className="counter">
          {message.length} / {MAX_MESSAGE_LENGTH}
        </span>
      </div>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <button type="submit" className="btn btn--accent btn--block" disabled={loading}>
        {loading ? 'Submitting' : 'Volunteer to help'}
      </button>
    </form>
  )
}

function VolunteerManagementView({ issueId }) {
  const { data, loading, error } = useQuery(VOLUNTEER_INTERESTS_BY_ISSUE_QUERY, {
    variables: { issueId },
    fetchPolicy: 'cache-and-network',
  })

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_VOLUNTEER_STATUS_MUTATION, {
    refetchQueries: [
      { query: VOLUNTEER_INTERESTS_BY_ISSUE_QUERY, variables: { issueId } },
      { query: COMMUNITY_SUMMARY_QUERY, variables: { issueId } },
    ],
  })

  const interests = data?.volunteerInterestsByIssue ?? []

  const handleStatusChange = async (volunteerInterestId, status) => {
    try {
      await updateStatus({ variables: { volunteerInterestId, status } })
    } catch (err) {
      console.error('Status update failed:', err.message)
    }
  }

  return (
    <section className="card" aria-labelledby="volunteer-management-title">
      <div className="card__header">
        <div className="card__header-body">
          <h2 id="volunteer-management-title" className="card__title">
            Volunteer roster
          </h2>
          <p className="card__subtitle">
            {interests.length === 0
              ? 'No one has stepped forward yet.'
              : `${interests.length} ${interests.length === 1 ? 'neighbor has' : 'neighbors have'} offered to help.`}
          </p>
        </div>
      </div>
      <div className="card__body">
        {loading && !data && <p className="loading-prose">Loading roster</p>}
        {error && (
          <div className="alert alert--warning" role="alert">
            Failed to load volunteer interests.
          </div>
        )}
        {!loading && !error && interests.length === 0 && (
          <p className="empty-prose">
            The community has not volunteered on this issue yet.
          </p>
        )}

        {interests.length > 0 && (
          <ul className="volunteer-list">
            {interests.map((interest) => (
              <li key={interest.id} className="volunteer fade-in">
                <div className="volunteer__head">
                  <div className="avatar avatar--resident" aria-hidden="true">
                    {getInitials(interest.fullName || interest.username)}
                  </div>
                  <div className="volunteer__identity">
                    <div className="volunteer__name">
                      {interest.fullName || interest.username}
                    </div>
                    {interest.contactEmail && (
                      <a
                        className="volunteer__email"
                        href={`mailto:${interest.contactEmail}`}
                      >
                        {interest.contactEmail}
                      </a>
                    )}
                  </div>
                  <label
                    htmlFor={`status-select-${interest.id}`}
                    className="visually-hidden"
                  >
                    Update status for {interest.fullName || interest.username}
                  </label>
                  <select
                    id={`status-select-${interest.id}`}
                    className={`status-select ${statusClass('status-select', interest.status)}`}
                    value={interest.status}
                    onChange={(event) => handleStatusChange(interest.id, event.target.value)}
                    disabled={updating}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                {interest.message && (
                  <p className="volunteer__message">{interest.message}</p>
                )}
                <div className="volunteer__time">
                  Submitted {formatDateTime(interest.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
