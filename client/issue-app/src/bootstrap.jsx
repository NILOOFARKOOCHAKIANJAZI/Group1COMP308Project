import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client/react'
import AppRoutes from './routes/AppRoutes'
import client from './services/apolloClient'
import './styles/global.css'
import './styles/staff.css'

// The main entry point for the IssueApp micro frontend, which sets up the Apollo Client and React Router context for the application.
export default function IssueApp() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ApolloProvider>
  )
}
