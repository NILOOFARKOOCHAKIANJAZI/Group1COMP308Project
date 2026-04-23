import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import PasswordField from './PasswordField'

const initialState = {
  fullName: '',
  username: '',
  email: '',
  password: '',
}

export default function RegisterForm() {
  const { register, busy, clearMessage } = useAuth()
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
      await register({
        ...formData,
        role: 'resident',
      })
      setFormData(initialState)
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed.')
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="card-header-row">
        <div>
          <p className="eyebrow">Create account</p>
          <h2>Register</h2>
        </div>
      </div>

      <label>
        Full name
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          minLength="2"
          maxLength="100"
        />
      </label>

      <label>
        Username
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          minLength="3"
          maxLength="30"
        />
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      <PasswordField
        name="password"
        value={formData.password}
        onChange={handleChange}
        minLength={6}
        autoComplete="new-password"
      />

      <div className="message info compact">
        New accounts are created as <strong>Resident</strong> accounts.
      </div>

      {errorMessage ? <div className="message error">{errorMessage}</div> : null}

      <button type="submit" className="primary-btn" disabled={busy}>
        {busy ? 'Creating account...' : 'Register'}
      </button>
    </form>
  )
}
