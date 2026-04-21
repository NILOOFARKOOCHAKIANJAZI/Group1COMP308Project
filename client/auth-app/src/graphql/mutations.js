import { gql } from '@apollo/client'

export const REGISTER_MUTATION = gql`
  mutation Register(
    $fullName: String!
    $username: String!
    $email: String!
    $password: String!
    $role: String
  ) {
    register(
      fullName: $fullName
      username: $username
      email: $email
      password: $password
      role: $role
    ) {
      success
      message
      token
      user {
        id
        fullName
        username
        email
        role
        createdAt
        updatedAt
      }
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      success
      message
      token
      user {
        id
        fullName
        username
        email
        role
        createdAt
        updatedAt
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`
