import { ApolloProvider } from '@apollo/client/react'
import client from './apollo'
import { AuthProvider } from './context/AuthContext'
import AuthShell from './components/AuthShell'
import './index.css'

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AuthShell />
      </AuthProvider>
    </ApolloProvider>
  )
}
