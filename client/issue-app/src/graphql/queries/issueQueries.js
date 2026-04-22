import { gql } from "@apollo/client";

export const MY_ISSUES = gql`
  query MyIssues {
    myIssues {
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
`;

export const ISSUE_BY_ID = gql`
  query IssueById($id: ID!) {
    issueById(id: $id) {
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
`;