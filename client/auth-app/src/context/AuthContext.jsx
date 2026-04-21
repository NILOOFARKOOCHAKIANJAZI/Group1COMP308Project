import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { CURRENT_USER_QUERY } from '../graphql/queries'
import { LOGIN_MUTATION, LOGOUT_MUTATION, REGISTER_MUTATION } from '../graphql/mutations'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const client = useApolloClient()
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token') || '')
  const [authMessage, setAuthMessage] = useState('')

  const { data, loading, error, refetch } = useQuery(CURRENT_USER_QUERY, {
    skip: !authToken,
    fetchPolicy: 'network-only',
  })

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION)
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION)
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION)

  useEffect(() => {
    if (!authToken) {
      localStorage.removeItem('token')
      client.clearStore().catch(() => {})
      return
    }

    localStorage.setItem('token', authToken)
  }, [authToken, client])

  const register = async (formValues) => {
    const { data: mutationData } = await registerMutation({
      variables: formValues,
    })

    const payload = mutationData?.register

    if (!payload?.success) {
      throw new Error(payload?.message || 'Registration failed.')
    }

    if (payload.token) {
      setAuthToken(payload.token)
    }

    setAuthMessage(payload.message || 'Registration successful.')
    await refetch()
    return payload
  }

  const login = async (formValues) => {
    const { data: mutationData } = await loginMutation({
      variables: formValues,
    })

    const payload = mutationData?.login

    if (!payload?.success) {
      throw new Error(payload?.message || 'Login failed.')
    }

    if (payload.token) {
      setAuthToken(payload.token)
    }

    setAuthMessage(payload.message || 'Login successful.')
    await refetch()
    return payload
  }

  const logout = async () => {
    try {
      await logoutMutation()
    } catch {
      // Even if logout mutation fails, clear local state for safety.
    }

    setAuthToken('')
    setAuthMessage('You have been logged out.')
    localStorage.removeItem('token')
    await client.clearStore().catch(() => {})
  }

  const value = useMemo(
    () => ({
      user: data?.currentUser || null,
      isAuthenticated: Boolean(data?.currentUser && authToken),
      authToken,
      authMessage,
      authError: error?.message || '',
      loading,
      busy: registerLoading || loginLoading || logoutLoading,
      register,
      login,
      logout,
      refetchCurrentUser: refetch,
      clearMessage: () => setAuthMessage(''),
    }),
    [
      authMessage,
      authToken,
      data?.currentUser,
      error?.message,
      loading,
      registerLoading,
      loginLoading,
      logoutLoading,
      refetch,
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
