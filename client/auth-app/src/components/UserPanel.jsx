import { useAuth } from '../context/AuthContext'

function formatDate(value) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function formatRole(role) {
  if (!role) return 'Unknown'

  const roleMap = {
    resident: 'Resident',
    staff: 'Municipal Staff',
    advocate: 'Community Advocate',
  }

  return roleMap[role] || role
}

export default function UserPanel() {
  const { user, logout, busy } = useAuth()

  if (!user) {
    return null
  }

  return (
    <section className="user-panel">
      <div className="user-panel-top">
        <div>
          <p className="eyebrow">Authenticated user</p>
          <h2>{user.fullName}</h2>
        </div>

        <button type="button" className="secondary-btn" onClick={logout} disabled={busy}>
          {busy ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      <div className="user-grid">
        <div className="info-box">
          <span>Username</span>
          <strong>@{user.username}</strong>
        </div>

        <div className="info-box">
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>

        <div className="info-box">
          <span>Role</span>
          <strong>{formatRole(user.role)}</strong>
        </div>

        <div className="info-box">
          <span>Joined</span>
          <strong>{formatDate(user.createdAt)}</strong>
        </div>
      </div>
    </section>
  )
}