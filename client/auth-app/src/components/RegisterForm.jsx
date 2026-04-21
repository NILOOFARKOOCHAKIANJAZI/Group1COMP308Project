import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const initialState = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  role: 'resident',
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
      await register(formData)
      setFormData(initialState)
    } catch (error) {
      setErrorMessage(error.message)
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
        <input name="fullName" value={formData.fullName} onChange={handleChange} required />
      </label>

      <label>
        Username
        <input name="username" value={formData.username} onChange={handleChange} required />
      </label>

      <label>
        Email
        <input name="email" type="email" value={formData.email} onChange={handleChange} required />
      </label>

      <label>
        Password
        <input
          name="password"
          type="password"
          minLength="6"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Role
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="resident">Resident</option>
          <option value="staff">Municipal Staff</option>
          <option value="advocate">Community Advocate</option>
        </select>
      </label>

      {errorMessage ? <div className="message error">{errorMessage}</div> : null}

      <button type="submit" className="primary-btn" disabled={busy}>
        {busy ? 'Creating account...' : 'Register'}
      </button>
    </form>
  )
}
