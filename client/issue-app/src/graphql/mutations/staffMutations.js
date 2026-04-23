import { gql } from '@apollo/client'

export const UPDATE_ISSUE_STATUS = gql`
  mutation UpdateIssueStatus($issueId: ID!, $status: String!, $internalNotes: String) {
    updateIssueStatus(issueId: $issueId, status: $status, internalNotes: $internalNotes) {
      success
      message
      issue {
        id
        status
        internalNotes
        updatedAt
      }
    }
  }
`

export const ASSIGN_ISSUE = gql`
  mutation AssignIssue($issueId: ID!, $assignedTo: String!, $assignedToUsername: String!) {
    assignIssue(
      issueId: $issueId
      assignedTo: $assignedTo
      assignedToUsername: $assignedToUsername
    ) {
      success
      message
      issue {
        id
        status
        assignedTo
        assignedToUsername
        updatedAt
      }
    }
  }
`

export const MARK_URGENT = gql`
  mutation MarkUrgent($issueId: ID!, $urgentAlert: Boolean!) {
    markUrgent(issueId: $issueId, urgentAlert: $urgentAlert) {
      success
      message
      issue {
        id
        urgentAlert
        updatedAt
      }
    }
  }
`
