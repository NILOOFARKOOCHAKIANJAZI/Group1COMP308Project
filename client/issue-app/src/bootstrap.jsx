import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client/react'
import AppRoutes from './routes/AppRoutes'
import client from './services/apolloClient'
import './styles/global.css'
import './styles/staff.css'

export default function IssueApp() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ApolloProvider>
  )
}
