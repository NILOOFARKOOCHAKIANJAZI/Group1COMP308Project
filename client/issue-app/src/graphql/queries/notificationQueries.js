import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      userId
      issueId
      message
      type
      isRead
      createdAt
      updatedAt
    }
  }
`;