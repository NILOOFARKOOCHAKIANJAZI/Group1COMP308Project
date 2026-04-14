// issue-service/graphql/typeDefs.js
const typeDefs = `#graphql
  type Location {
    address: String
    latitude: Float
    longitude: Float
    neighborhood: String
  }

  type Issue {
    id: ID!
    title: String!
    description: String!
    category: String!
    aiCategory: String
    aiSummary: String
    priority: String!
    status: String!
    photoUrl: String
    location: Location
    reportedBy: String!
    reportedByUsername: String!
    assignedTo: String
    assignedToUsername: String
    urgentAlert: Boolean!
    internalNotes: String
    createdAt: String!
    updatedAt: String!
  }

  type Notification {
    id: ID!
    userId: String!
    issueId: String!
    message: String!
    type: String!
    isRead: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input LocationInput {
    address: String
    latitude: Float
    longitude: Float
    neighborhood: String
  }

  input ReportIssueInput {
    title: String!
    description: String!
    category: String
    priority: String
    photoUrl: String
    location: LocationInput
    aiCategory: String
    aiSummary: String
  }

  type IssuePayload {
    success: Boolean!
    message: String!
    issue: Issue
  }

  type NotificationPayload {
    success: Boolean!
    message: String!
    notification: Notification
  }

  type Query {
    myIssues: [Issue!]!
    allIssues: [Issue!]!
    issueById(id: ID!): Issue
    urgentIssues: [Issue!]!
    notifications: [Notification!]!
  }

  type Mutation {
    reportIssue(input: ReportIssueInput!): IssuePayload!
    updateIssueStatus(
      issueId: ID!
      status: String!
      internalNotes: String
    ): IssuePayload!

    assignIssue(
      issueId: ID!
      assignedTo: String!
      assignedToUsername: String!
    ): IssuePayload!

    markUrgent(
      issueId: ID!
      urgentAlert: Boolean!
    ): IssuePayload!

    markNotificationAsRead(notificationId: ID!): NotificationPayload!
  }
`;

export default typeDefs;