import { gql } from '@apollo/client'

export const ALL_ISSUES = gql`
  query AllIssues {
    allIssues {
      id
      title
      description
      category
      aiCategory
      aiSummary
      priority
      status
      photoUrl
      urgentAlert
      internalNotes
      reportedBy
      reportedByUsername
      assignedTo
      assignedToUsername
      createdAt
      updatedAt
      location {
        address
        latitude
        longitude
        neighborhood
      }
    }
  }
`

export const URGENT_ISSUES = gql`
  query UrgentIssues {
    urgentIssues {
      id
      title
      description
      category
      priority
      status
      urgentAlert
      reportedByUsername
      assignedToUsername
      createdAt
      updatedAt
      location {
        address
        neighborhood
      }
    }
  }
`
