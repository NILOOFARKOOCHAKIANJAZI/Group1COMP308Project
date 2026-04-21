import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import UserPanel from './UserPanel'
import { useAuth } from '../context/AuthContext'

export default function AuthShell() {
  const [activeTab, setActiveTab] = useState('login')
  const { isAuthenticated, loading, authMessage, authError, user } = useAuth()

  return (
    <div className="auth-shell">
      <section className="hero-card">
        <p className="eyebrow">CivicCase</p>
        <h1>Authentication & User Management</h1>
        <p className="hero-text">
          This micro frontend connects to the existing GraphQL gateway and auth service to support
          registration, login, logout, role-based access, and current user retrieval.
        </p>

        <div className="pill-row">
          <span className="pill">JWT</span>
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
              Protected view unlocked for <strong>{user?.role}</strong> user.
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
