import { ApolloProvider } from '@apollo/client/react'
import client from './apollo'
import CommunityApp from './components/CommunityApp.jsx'
import './index.css'

// The main App component for the CommunityApp micro frontend, which sets up the Apollo Client context and renders the CommunityApp component. 
export default function App({ issueId, currentUser }) {
  return (
    <ApolloProvider client={client}>
      <div className="community-shell">
        <CommunityApp issueId={issueId} currentUser={currentUser} />
      </div>
    </ApolloProvider>
  )
}
