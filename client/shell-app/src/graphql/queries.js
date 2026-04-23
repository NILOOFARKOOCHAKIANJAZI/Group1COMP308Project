import { gql } from '@apollo/client'

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      fullName
      username
      email
      role
      createdAt
      updatedAt
    }
  }
`

export const CHATBOT_QUERY = gql`
  query Chatbot($question: [MessageInput!]!) {
    chatbotQuery(question: $question) {
      text
      success
      message
    }
  }
`
