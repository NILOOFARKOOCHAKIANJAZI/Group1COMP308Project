import { gql } from '@apollo/client'

export const CLASSIFY_ISSUE_QUERY = gql`
  query ClassifyIssue($title: String!, $description: String!) {
    classifyIssue(title: $title, description: $description) {
      success
      message
      category
      priority
      summary
    }
  }
`