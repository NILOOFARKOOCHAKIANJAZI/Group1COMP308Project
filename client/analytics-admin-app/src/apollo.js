import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000/graphql'

// Create an Apollo Client instance that connects to the GraphQL gateway, with credentials included for cookie-based authentication
const httpLink = createHttpLink({
  uri: GATEWAY_URL,
  credentials: 'include',
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

export default client