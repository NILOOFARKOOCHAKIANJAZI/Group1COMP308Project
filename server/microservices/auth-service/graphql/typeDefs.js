// auth-service/graphql/typeDefs.js
const typeDefs = `#graphql
  type User {
    id: ID!
    fullName: String!
    username: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    user: User
    token: String
  }

  type LogoutPayload {
    success: Boolean!
    message: String!
  }

  type Query {
    currentUser: User
  }

  type Mutation {
    register(
      fullName: String!
      username: String!
      email: String!
      password: String!
      role: String
    ): AuthPayload!

    login(
      usernameOrEmail: String!
      password: String!
    ): AuthPayload!

    logout: LogoutPayload!
  }
`;

export default typeDefs;