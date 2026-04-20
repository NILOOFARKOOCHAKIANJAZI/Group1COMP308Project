import { ApolloProvider } from '@apollo/client/react'
import client from './apollo'
import CommunityApp from './components/CommunityApp.jsx'
import './index.css'

export default function App({ issueId, currentUser }) {
  return (
    <ApolloProvider client={client}>
      <CommunityApp issueId={issueId} currentUser={currentUser} />
    </ApolloProvider>
  )
}
