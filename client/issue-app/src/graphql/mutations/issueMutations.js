import { gql } from "@apollo/client";

export const REPORT_ISSUE = gql`
  mutation ReportIssue($input: ReportIssueInput!) {
    reportIssue(input: $input) {
      success
      message
      issue {
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
        createdAt
        updatedAt

        reportedByUsername
        assignedToUsername

        location {
          address
          latitude
          longitude
          neighborhood
        }
      }
    }
  }
`;