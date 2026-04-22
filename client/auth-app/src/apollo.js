import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000/graphql'

const httpLink = createHttpLink({
  uri: GATEWAY_URL,
  credentials: 'include',
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

export default client