import { gql } from '@apollo/client'

export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($issueId: String!, $content: String!) {
    addComment(issueId: $issueId, content: $content) {
      success
      message
      comment {
        id
        issueId
        userId
        username
        role
        content
        createdAt
      }
    }
  }
`

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      success
      message
      comment {
        id
      }
    }
  }
`

export const ADD_UPVOTE_MUTATION = gql`
  mutation AddUpvote($issueId: String!) {
    addUpvote(issueId: $issueId) {
      success
      message
      reaction {
        id
        userId
        username
      }
    }
  }
`

export const REMOVE_UPVOTE_MUTATION = gql`
  mutation RemoveUpvote($issueId: String!) {
    removeUpvote(issueId: $issueId) {
      success
      message
    }
  }
`

export const EXPRESS_VOLUNTEER_INTEREST_MUTATION = gql`
  mutation ExpressVolunteerInterest($input: VolunteerInterestInput!) {
    expressVolunteerInterest(input: $input) {
      success
      message
      volunteerInterest {
        id
        issueId
        status
        fullName
        contactEmail
        message
        createdAt
      }
    }
  }
`

export const UPDATE_VOLUNTEER_STATUS_MUTATION = gql`
  mutation UpdateVolunteerInterestStatus($volunteerInterestId: ID!, $status: String!) {
    updateVolunteerInterestStatus(
      volunteerInterestId: $volunteerInterestId
      status: $status
    ) {
      success
      message
      volunteerInterest {
        id
        status
      }
    }
  }
`
