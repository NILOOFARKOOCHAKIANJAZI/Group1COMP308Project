// analytics-ai-service/graphql/typeDefs.js
const typeDefs = `#graphql
  type AIInsightLog {
    id: ID!
    insightType: String!
    relatedIssueId: String
    requestedByUserId: String
    requestedByUsername: String
    prompt: String!
    responseText: String!
    metadata: JSONString
    createdAt: String!
    updatedAt: String!
  }

  scalar JSONString

  type DashboardStats {
    totalIssues: Int!
    openIssues: Int!
    urgentIssues: Int!
    resolvedIssues: Int!
    totalComments: Int!
    totalUpvotes: Int!
    totalVolunteerInterests: Int!
  }

  type CategoryCount {
    category: String!
    count: Int!
  }

  type NeighborhoodHotspot {
    neighborhood: String!
    count: Int!
  }

  type ClassificationResult {
    success: Boolean!
    message: String!
    category: String
    priority: String
    summary: String
  }

  type AITextResult {
    success: Boolean!
    message: String!
    text: String
  }
    
  input MessageInput {
    role: String!    # "user" or "assistant"
    content: String! # The actual text
  }

  type Query {
    dashboardStats: DashboardStats!
    issuesByCategory: [CategoryCount!]!
    neighborhoodHotspots: [NeighborhoodHotspot!]!
    recentAiInsightLogs(limit: Int): [AIInsightLog!]!

    classifyIssue(title: String!, description: String!): ClassificationResult!
    summarizeIssue(
      issueId: String
      title: String!
      description: String!
      comments: [String!]
    ): AITextResult!

    trendInsights: AITextResult!
    chatbotQuery(question: [MessageInput!]): AITextResult!
  }
`;

export default typeDefs;