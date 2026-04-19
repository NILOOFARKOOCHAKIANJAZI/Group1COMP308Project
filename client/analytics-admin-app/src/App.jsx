import { ApolloProvider } from '@apollo/client/react'
import client from './apollo'
import AiChatBox from './components/AiChatBox'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AiChatBox />
    </ApolloProvider>
  )
}