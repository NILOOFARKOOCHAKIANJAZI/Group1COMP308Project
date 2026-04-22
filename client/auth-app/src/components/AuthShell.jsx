import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import UserPanel from './UserPanel'
import { useAuth } from '../context/AuthContext'

function formatRole(role) {
  if (!role) return 'authenticated'

  const roleMap = {
    resident: 'Resident',
    staff: 'Municipal Staff',
    advocate: 'Community Advocate',
  }

  return roleMap[role] || role
}

export default function AuthShell() {
  const [activeTab, setActiveTab] = useState('login')
  const { isAuthenticated, loading, authMessage, authError, user } = useAuth()

  return (
    <div className="auth-shell">
      <section className="hero-card">
        <p className="eyebrow">CivicCase</p>
        <h1>Authentication &amp; User Management</h1>
        <p className="hero-text">
          This micro frontend uses the GraphQL gateway and auth service to support resident
          registration, secure login, logout, session restoration, and current user retrieval with
          HTTP-only cookie authentication.
        </p>

        <div className="pill-row">
          <span className="pill">JWT</span>
          <span className="pill">HTTP-only Cookie</span>
          <span className="pill">GraphQL Gateway</span>
          <span className="pill">MongoDB User Model</span>
          <span className="pill">Role Aware</span>
        </div>
      </section>

      <section className="content-card">
        {loading ? <div className="message info">Checking current session...</div> : null}

        {authMessage ? <div className="message success">{authMessage}</div> : null}

        {authError ? <div className="message error">{authError}</div> : null}

        {isAuthenticated ? (
          <>
            <UserPanel />
            <div className="message info compact">
              Protected view unlocked for <strong>{formatRole(user?.role)}</strong>.
            </div>
          </>
        ) : (
          <>
            <div className="tab-row">
              <button
                type="button"
                className={activeTab === 'login' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>

              <button
                type="button"
                className={activeTab === 'register' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>

            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </>
        )}
      </section>
    </div>
  )
}