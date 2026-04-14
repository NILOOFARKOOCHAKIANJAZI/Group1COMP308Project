// community-service/graphql/typeDefs.js
const typeDefs = `#graphql
  type Comment {
    id: ID!
    issueId: String!
    userId: String!
    username: String!
    role: String!
    content: String!
    createdAt: String!
    updatedAt: String!
  }

  type IssueReaction {
    id: ID!
    issueId: String!
    userId: String!
    username: String!
    reactionType: String!
    createdAt: String!
    updatedAt: String!
  }

  type VolunteerInterest {
    id: ID!
    issueId: String!
    userId: String!
    username: String!
    fullName: String
    contactEmail: String
    message: String
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type CommunitySummary {
    issueId: String!
    totalComments: Int!
    totalUpvotes: Int!
    totalVolunteers: Int!
  }

  type CommentPayload {
    success: Boolean!
    message: String!
    comment: Comment
  }

  type ReactionPayload {
    success: Boolean!
    message: String!
    reaction: IssueReaction
  }

  type VolunteerPayload {
    success: Boolean!
    message: String!
    volunteerInterest: VolunteerInterest
  }

  input VolunteerInterestInput {
    issueId: String!
    fullName: String
    contactEmail: String
    message: String
  }

  type Query {
    commentsByIssue(issueId: String!): [Comment!]!
    upvotesByIssue(issueId: String!): [IssueReaction!]!
    volunteerInterestsByIssue(issueId: String!): [VolunteerInterest!]!
    myVolunteerInterests: [VolunteerInterest!]!
    communitySummary(issueId: String!): CommunitySummary!
  }

  type Mutation {
    addComment(issueId: String!, content: String!): CommentPayload!
    deleteComment(commentId: ID!): CommentPayload!

    addUpvote(issueId: String!): ReactionPayload!
    removeUpvote(issueId: String!): ReactionPayload!

    expressVolunteerInterest(input: VolunteerInterestInput!): VolunteerPayload!
    updateVolunteerInterestStatus(volunteerInterestId: ID!, status: String!): VolunteerPayload!
  }
`;

export default typeDefs;