import { gql } from '@apollo/client'

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      fullName
      username
      email
      role
    }
  }
`

export const COMMUNITY_SUMMARY_QUERY = gql`
  query CommunitySummary($issueId: String!) {
    communitySummary(issueId: $issueId) {
      issueId
      totalComments
      totalUpvotes
      totalVolunteers
    }
  }
`

export const COMMENTS_BY_ISSUE_QUERY = gql`
  query CommentsByIssue($issueId: String!) {
    commentsByIssue(issueId: $issueId) {
      id
      issueId
      userId
      username
      role
      content
      createdAt
    }
  }
`

export const UPVOTES_BY_ISSUE_QUERY = gql`
  query UpvotesByIssue($issueId: String!) {
    upvotesByIssue(issueId: $issueId) {
      id
      userId
      username
      createdAt
    }
  }
`

export const VOLUNTEER_INTERESTS_BY_ISSUE_QUERY = gql`
  query VolunteerInterestsByIssue($issueId: String!) {
    volunteerInterestsByIssue(issueId: $issueId) {
      id
      issueId
      userId
      username
      fullName
      contactEmail
      message
      status
      createdAt
    }
  }
`

export const MY_VOLUNTEER_INTERESTS_QUERY = gql`
  query MyVolunteerInterests {
    myVolunteerInterests {
      id
      issueId
      status
      fullName
      contactEmail
      message
      createdAt
    }
  }
`
