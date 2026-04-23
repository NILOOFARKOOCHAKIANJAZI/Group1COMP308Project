import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { COMMENTS_BY_ISSUE_QUERY, COMMUNITY_SUMMARY_QUERY } from '../graphql/queries'
import { ADD_COMMENT_MUTATION, DELETE_COMMENT_MUTATION } from '../graphql/mutations'
import { getInitials, roleClass, formatRelativeOrDate, isPrivileged } from '../utils/format'

const MIN_COMMENT_LENGTH = 2
const MAX_COMMENT_LENGTH = 1000


//  displays a list of comments for a given issue and allows authenticated users to add new comments or delete their own comments. 
export default function CommentsPanel({ issueId, currentUser }) {
  const [draft, setDraft] = useState('')
  const [submissionError, setSubmissionError] = useState('')

  const { data, loading, error } = useQuery(COMMENTS_BY_ISSUE_QUERY, {
    variables: { issueId },
    fetchPolicy: 'cache-and-network',
  })

  const refetchQueries = [
    { query: COMMENTS_BY_ISSUE_QUERY, variables: { issueId } },
    { query: COMMUNITY_SUMMARY_QUERY, variables: { issueId } },
  ]

  const [addComment, { loading: adding }] = useMutation(ADD_COMMENT_MUTATION, { refetchQueries })
  const [deleteComment, { loading: deleting }] = useMutation(DELETE_COMMENT_MUTATION, { refetchQueries })

  const comments = data?.commentsByIssue ?? []

  const canDelete = (comment) =>
    comment.userId === currentUser.id || isPrivileged(currentUser)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmissionError('')

    const trimmed = draft.trim()
    if (trimmed.length < MIN_COMMENT_LENGTH) {
      setSubmissionError(`Comment must be at least ${MIN_COMMENT_LENGTH} characters long.`)
      return
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setSubmissionError(`Comment must not exceed ${MAX_COMMENT_LENGTH} characters.`)
      return
    }

    try {
      const result = await addComment({ variables: { issueId, content: trimmed } })
      const payload = result.data?.addComment
      if (payload?.success) {
        setDraft('')
      } else {
        setSubmissionError(payload?.message || 'Failed to add comment.')
      }
    } catch (err) {
      setSubmissionError(err.message)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      const result = await deleteComment({ variables: { commentId } })
      const payload = result.data?.deleteComment
      if (!payload?.success) {
        console.error('Delete failed:', payload?.message)
      }
    } catch (err) {
      console.error('Delete error:', err.message)
    }
  }

  return (
    <section className="card" aria-labelledby="comments-title">
      <div className="card__header">
        <div className="card__header-body">
          <h2 id="comments-title" className="card__title">
            The conversation
          </h2>
          <p className="card__subtitle">
            Share how this issue affects you or your neighbors
          </p>
        </div>
      </div>
      <div className="card__body">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="new-comment-input" className="visually-hidden">
              Add a comment
            </label>
            <textarea
              id="new-comment-input"
              className="textarea"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="What do you want the community to know?"
              rows={3}
              maxLength={MAX_COMMENT_LENGTH}
              aria-describedby="new-comment-help"
              required
            />
            <span id="new-comment-help" className="counter">
              {draft.length} / {MAX_COMMENT_LENGTH}
            </span>
          </div>
          {submissionError && (
            <div className="alert alert--danger" role="alert">
              {submissionError}
            </div>
          )}
          <button
            type="submit"
            className="btn"
            disabled={adding || draft.trim().length < MIN_COMMENT_LENGTH}
          >
            {adding ? 'Posting' : 'Post comment'}
          </button>
        </form>

        {loading && !data && <p className="loading-prose">Loading the conversation</p>}
        {error && (
          <div className="alert alert--warning" role="alert">
            Failed to load comments.
          </div>
        )}
        {!loading && !error && comments.length === 0 && (
          <p className="empty-prose">Quiet so far. Be the first to speak up.</p>
        )}

        {comments.length > 0 && (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment fade-in">
                <div
                  className={`avatar ${roleClass('avatar', comment.role)}`}
                  aria-hidden="true"
                >
                  {getInitials(comment.username)}
                </div>
                <div className="comment__body">
                  <div className="comment__meta">
                    <span className="comment__author">{comment.username}</span>
                    <span className={`role-pill ${roleClass('role-pill', comment.role)}`}>
                      {comment.role}
                    </span>
                  </div>
                  <p className="comment__content">{comment.content}</p>
                  <time className="comment__time" dateTime={comment.createdAt}>
                    {formatRelativeOrDate(comment.createdAt)}
                  </time>
                </div>
                {canDelete(comment) && (
                  <div className="comment__actions">
                    <button
                      type="button"
                      className="btn btn--danger-text"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleting}
                      aria-label={`Delete comment by ${comment.username}`}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
