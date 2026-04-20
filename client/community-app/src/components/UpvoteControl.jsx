import { useQuery, useMutation } from '@apollo/client/react'
import { UPVOTES_BY_ISSUE_QUERY, COMMUNITY_SUMMARY_QUERY } from '../graphql/queries'
import { ADD_UPVOTE_MUTATION, REMOVE_UPVOTE_MUTATION } from '../graphql/mutations'

export default function UpvoteControl({ issueId, currentUser }) {
  const { data, loading, error } = useQuery(UPVOTES_BY_ISSUE_QUERY, {
    variables: { issueId },
    fetchPolicy: 'cache-and-network',
  })

  const refetchQueries = [
    { query: UPVOTES_BY_ISSUE_QUERY, variables: { issueId } },
    { query: COMMUNITY_SUMMARY_QUERY, variables: { issueId } },
  ]

  const [addUpvote, { loading: adding }] = useMutation(ADD_UPVOTE_MUTATION, { refetchQueries })
  const [removeUpvote, { loading: removing }] = useMutation(REMOVE_UPVOTE_MUTATION, { refetchQueries })

  const upvotes = data?.upvotesByIssue ?? []
  const hasUpvoted = upvotes.some((reaction) => reaction.userId === currentUser.id)
  const busy = adding || removing
  const count = upvotes.length

  const handleToggle = async () => {
    try {
      if (hasUpvoted) {
        await removeUpvote({ variables: { issueId } })
      } else {
        await addUpvote({ variables: { issueId } })
      }
    } catch (err) {
      console.error('Upvote toggle failed:', err.message)
    }
  }

  const supportText = loading && !data
    ? 'Loading support'
    : error
      ? 'Could not load support count'
      : count === 0
        ? 'Be the first to show your support'
        : count === 1
          ? 'neighbor stands behind this issue'
          : 'neighbors stand behind this issue'

  return (
    <section className="card upvote-card" aria-labelledby="upvotes-title">
      <div className="upvote-card__body">
        <div className="upvote-card__eyebrow">Local support</div>
        <div className="upvote-card__count" aria-live="polite">{count}</div>
        <p className="upvote-card__text">
          <span className="visually-hidden">Upvote count: </span>
          {supportText}
        </p>
        <h2 id="upvotes-title" className="visually-hidden">Upvotes</h2>
        <button
          type="button"
          className={`upvote-btn ${hasUpvoted ? 'upvote-btn--active' : ''}`}
          onClick={handleToggle}
          disabled={busy}
          aria-pressed={hasUpvoted}
          aria-label={hasUpvoted ? 'Remove your upvote' : 'Upvote this issue'}
        >
          {busy ? 'Saving' : hasUpvoted ? 'Supported' : 'Support'}
        </button>
      </div>
    </section>
  )
}
