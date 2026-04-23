import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import PasswordField from './PasswordField'

const initialState = {
  usernameOrEmail: '',
  password: '',
}

export default function LoginForm() {
  const { login, busy, clearMessage } = useAuth()
  const [formData, setFormData] = useState(initialState)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    clearMessage()
    setErrorMessage('')
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      await login({
        usernameOrEmail: formData.usernameOrEmail.trim(),
        password: formData.password,
      })
      setFormData(initialState)
    } catch (error) {
      setErrorMessage(error.message || 'Login failed.')
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="card-header-row">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>Login</h2>
        </div>
      </div>

      <label>
        Username or email
        <input
          name="usernameOrEmail"
          value={formData.usernameOrEmail}
          onChange={handleChange}
          required
          autoComplete="username"
        />
      </label>

      <PasswordField
        name="password"
        value={formData.password}
        onChange={handleChange}
        autoComplete="current-password"
      />

      {errorMessage ? <div className="message error">{errorMessage}</div> : null}

      <button type="submit" className="primary-btn" disabled={busy}>
        {busy ? 'Signing in...' : 'Login'}
      </button>
    </form>
  )
}
