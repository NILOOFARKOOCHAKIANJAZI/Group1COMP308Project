import { createContext, useContext, useMemo, useState } from 'react'
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { CURRENT_USER_QUERY } from '../graphql/queries'
import { LOGIN_MUTATION, LOGOUT_MUTATION, REGISTER_MUTATION } from '../graphql/mutations'

const AuthContext = createContext(null)

const AUTH_CHANGED_EVENT = 'civiccase-auth-changed'

function notifyShell(type) {
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGED_EVENT, {
      detail: { type },
    }),
  )
}

export function AuthProvider({ children }) {
  const client = useApolloClient()
  const [authMessage, setAuthMessage] = useState('')

  const {
    data,
    loading,
    error,
    refetch: refetchCurrentUserQuery,
  } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION)
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION)
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION)

  const refetchCurrentUser = async () => {
    try {
      const result = await refetchCurrentUserQuery()
      return result?.data?.currentUser || null
    } catch {
      return null
    }
  }

  const register = async (formValues) => {
    const payloadVariables = {
      fullName: formValues.fullName.trim(),
      username: formValues.username.trim(),
      email: formValues.email.trim().toLowerCase(),
      password: formValues.password,
      role: 'resident',
    }

    const { data: mutationData } = await registerMutation({
      variables: payloadVariables,
    })

    const payload = mutationData?.register

    if (!payload?.success) {
      throw new Error(payload?.message || 'Registration failed.')
    }

    setAuthMessage(payload.message || 'Registration successful. Please log in.')
    notifyShell('register')

    return payload
  }

  const login = async (formValues) => {
    const payloadVariables = {
      usernameOrEmail: formValues.usernameOrEmail.trim(),
      password: formValues.password,
    }

    const { data: mutationData } = await loginMutation({
      variables: payloadVariables,
    })

    const payload = mutationData?.login

    if (!payload?.success) {
      throw new Error(payload?.message || 'Login failed.')
    }

    await client.clearStore().catch(() => {})
    await refetchCurrentUser()

    setAuthMessage(payload.message || 'Login successful.')
    notifyShell('login')

    return payload
  }

  const logout = async () => {
    try {
      await logoutMutation()
    } catch {
      // Even if the server logout fails, continue clearing local Apollo state.
    }

    await client.clearStore().catch(() => {})
    await refetchCurrentUser()

    setAuthMessage('You have been logged out.')
    notifyShell('logout')
  }

  const clearMessage = () => setAuthMessage('')

  const value = useMemo(
    () => ({
      user: data?.currentUser || null,
      isAuthenticated: Boolean(data?.currentUser),
      authMessage,
      authError: error?.message || '',
      loading,
      busy: registerLoading || loginLoading || logoutLoading,
      register,
      login,
      logout,
      refetchCurrentUser,
      clearMessage,
    }),
    [
      data?.currentUser,
      authMessage,
      error?.message,
      loading,
      registerLoading,
      loginLoading,
      logoutLoading,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}