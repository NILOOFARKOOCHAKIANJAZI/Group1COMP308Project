import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { STATUS_OPTIONS, formatLabel } from '../../utils/issueEnums'
import {
  UPDATE_ISSUE_STATUS,
  ASSIGN_ISSUE,
  MARK_URGENT,
} from '../../graphql/mutations/staffMutations'
import { ISSUE_BY_ID } from '../../graphql/queries/issueQueries'
import { ALL_ISSUES, URGENT_ISSUES } from '../../graphql/queries/staffQueries'


// provides staff members with controls to update the status and internal notes of an issue, assign the issue to themselves, and  the urgent flag.
export default function StaffControlsPanel({ issue, currentUser }) {
  const [status, setStatus] = useState(issue.status)
  const [internalNotes, setInternalNotes] = useState(issue.internalNotes || '')
  const [statusMessage, setStatusMessage] = useState(null)
  const [assignMessage, setAssignMessage] = useState(null)
  const [urgentMessage, setUrgentMessage] = useState(null)

  const refetchQueries = [
    { query: ISSUE_BY_ID, variables: { id: issue.id } },
    { query: ALL_ISSUES },
    { query: URGENT_ISSUES },
  ]

  const [updateStatus, { loading: statusLoading }] = useMutation(UPDATE_ISSUE_STATUS, {
    refetchQueries,
  })

  const [assignIssue, { loading: assignLoading }] = useMutation(ASSIGN_ISSUE, {
    refetchQueries,
  })

  const [markUrgent, { loading: urgentLoading }] = useMutation(MARK_URGENT, {
    refetchQueries,
  })

  const handleStatusUpdate = async () => {
    setStatusMessage(null)
    try {
      const result = await updateStatus({
        variables: {
          issueId: issue.id,
          status,
          internalNotes: internalNotes.trim(),
        },
      })

      const payload = result.data?.updateIssueStatus
      if (payload?.success) {
        setStatusMessage({ type: 'success', text: 'Status and notes updated.' })
      } else {
        setStatusMessage({
          type: 'error',
          text: payload?.message || 'Failed to update status.',
        })
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  const handleTakeOwnership = async () => {
    setAssignMessage(null)
    try {
      const result = await assignIssue({
        variables: {
          issueId: issue.id,
          assignedTo: currentUser.id,
          assignedToUsername: currentUser.username,
        },
      })

      const payload = result.data?.assignIssue
      if (payload?.success) {
        setAssignMessage({
          type: 'success',
          text: `Assigned to ${currentUser.username}.`,
        })
      } else {
        setAssignMessage({
          type: 'error',
          text: payload?.message || 'Failed to assign issue.',
        })
      }
    } catch (err) {
      setAssignMessage({ type: 'error', text: err.message })
    }
  }

  const handleUrgentToggle = async () => {
    setUrgentMessage(null)
    const nextValue = !issue.urgentAlert
    try {
      const result = await markUrgent({
        variables: {
          issueId: issue.id,
          urgentAlert: nextValue,
        },
      })

      const payload = result.data?.markUrgent
      if (payload?.success) {
        setUrgentMessage({
          type: 'success',
          text: nextValue ? 'Flagged as urgent.' : 'Urgent flag removed.',
        })
      } else {
        setUrgentMessage({
          type: 'error',
          text: payload?.message || 'Failed to toggle urgent flag.',
        })
      }
    } catch (err) {
      setUrgentMessage({ type: 'error', text: err.message })
    }
  }

  const assignedLabel = issue.assignedToUsername
    ? `Assigned to ${issue.assignedToUsername}`
    : 'Not assigned to anyone yet'

  const isSelfAssigned = issue.assignedTo === currentUser.id

  return (
    <>
      <div className="staff-card">
        <div className="staff-card__head">
          <div className="staff-card__title">Status and notes</div>
        </div>
        <div className="staff-card__body">
          <div className="staff-form-field">
            <label htmlFor="status-select" className="staff-form-field__label">
              Workflow status
            </label>
            <select
              id="status-select"
              className="staff-form-field__select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-form-field">
            <label htmlFor="notes-textarea" className="staff-form-field__label">
              Internal notes
            </label>
            <textarea
              id="notes-textarea"
              className="staff-form-field__textarea"
              value={internalNotes}
              onChange={(event) => setInternalNotes(event.target.value)}
              placeholder="Share context with your team. Residents will not see these notes."
              rows={3}
            />
          </div>

          <button
            type="button"
            className="staff-btn staff-btn--primary staff-btn--block"
            onClick={handleStatusUpdate}
            disabled={statusLoading}
          >
            {statusLoading ? 'Saving...' : 'Save changes'}
          </button>

          {statusMessage && (
            <div className={`staff-message staff-message--${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>

      <div className="staff-card">
        <div className="staff-card__head">
          <div className="staff-card__title">Assignment</div>
        </div>
        <div className="staff-card__body">
          <div className="staff-form-field">
            <div className="staff-form-field__label">Currently</div>
            <div style={{ fontSize: 13, color: 'var(--staff-ink)', fontWeight: 500 }}>
              {assignedLabel}
            </div>
          </div>

          <button
            type="button"
            className="staff-btn staff-btn--accent staff-btn--block"
            onClick={handleTakeOwnership}
            disabled={assignLoading || isSelfAssigned}
          >
            {assignLoading
              ? 'Assigning...'
              : isSelfAssigned
                ? 'Already assigned to you'
                : 'Take ownership'}
          </button>

          {assignMessage && (
            <div className={`staff-message staff-message--${assignMessage.type}`}>
              {assignMessage.text}
            </div>
          )}
        </div>
      </div>

      <div className="staff-card">
        <div className="staff-card__head">
          <div className="staff-card__title">Urgent flag</div>
        </div>
        <div className="staff-card__body">
          <div className={`staff-toggle ${issue.urgentAlert ? 'staff-toggle--active' : ''}`}>
            <div style={{ flex: 1 }}>
              <div className="staff-toggle__label">
                {issue.urgentAlert ? 'Flagged as urgent' : 'Standard priority'}
              </div>
              <div className="staff-toggle__hint">
                {issue.urgentAlert
                  ? 'Resident was notified about the urgent flag.'
                  : 'Flip this to notify the resident and mark for priority handling.'}
              </div>
            </div>
            <button
              type="button"
              className="staff-toggle__switch"
              aria-pressed={issue.urgentAlert}
              aria-label={issue.urgentAlert ? 'Remove urgent flag' : 'Mark as urgent'}
              onClick={handleUrgentToggle}
              disabled={urgentLoading}
            />
          </div>

          {urgentMessage && (
            <div className={`staff-message staff-message--${urgentMessage.type}`}>
              {urgentMessage.text}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
