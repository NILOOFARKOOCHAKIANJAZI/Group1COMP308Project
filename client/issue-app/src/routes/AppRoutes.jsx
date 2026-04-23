import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import ReportIssuePage from '../pages/resident/ReportIssuePage'
import MyIssuesPage from '../pages/resident/MyIssuesPage'
import NotificationsPage from '../pages/resident/NotificationsPage'
import IssueDetailsPage from '../pages/shared/IssueDetailsPage'
import AllIssuesPage from '../pages/staff/AllIssuesPage'
import UrgentIssuesPage from '../pages/staff/UrgentIssuesPage'
import StaffNotificationsPage from '../pages/staff/StaffNotificationsPage'
import NotFoundPage from '../pages/NotFoundPage'
import { GET_NOTIFICATIONS } from '../graphql/queries/notificationQueries'
import { CURRENT_USER_QUERY } from '../graphql/queries/userQueries'
import useStaffNotifications from '../hooks/useStaffNotifications'

const PRIVILEGED_ROLES = ['staff', 'advocate']

const RESIDENT_LINKS = [
  { to: '/report-issue', label: 'Report issue' },
  { to: '/my-issues', label: 'My issues' },
  { to: '/notifications', label: 'Notifications' },
]

const STAFF_LINKS = [
  { to: '/staff/dashboard', label: 'Dashboard' },
  { to: '/staff/urgent', label: 'Urgent' },
  { to: '/notifications', label: 'Notifications' },
]

function StaffTopBar({ currentUser, links, unreadCount }) {
  const location = useLocation()

  return (
    <header className="staff-topbar">
      <div className="staff-topbar__stripe" aria-hidden="true" />
      <div className="staff-topbar__inner">
        <div className="staff-topbar__brand">
          <span className="staff-topbar__mark" aria-hidden="true" />
          <div className="staff-topbar__wordmark">
            <span className="staff-topbar__title">
              {PRIVILEGED_ROLES.includes(currentUser?.role)
                ? 'Issue Management'
                : 'Resident Portal'}
            </span>
          </div>
        </div>

        <nav className="staff-topbar__nav" aria-label="Primary">
          {links.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(`${link.to}/`))
            const showBadge = link.to === '/notifications' && unreadCount > 0

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`staff-nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
                {showBadge && <span className="staff-nav-badge">{unreadCount}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default function AppRoutes() {
  const { data: userData, loading: userLoading } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  const currentUser = userData?.currentUser
  const isStaff = PRIVILEGED_ROLES.includes(currentUser?.role)
  const links = isStaff ? STAFF_LINKS : RESIDENT_LINKS

  const { data: residentNotifData } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 10000,
    skip: isStaff,
  })

  const { unreadCount: staffUnreadCount } = useStaffNotifications({
    userId: currentUser?.id,
    enabled: isStaff,
  })

  const residentNotifications = residentNotifData?.notifications || []
  const residentUnreadCount = residentNotifications.filter((n) => !n.isRead).length
  const unreadCount = isStaff ? staffUnreadCount : residentUnreadCount

  if (userLoading && !currentUser) {
    return (
      <div className="staff-shell">
        <main className="staff-main">
          <div className="staff-loading">Authenticating</div>
        </main>
      </div>
    )
  }

  return (
    <div className="staff-shell">
      <StaffTopBar
        currentUser={currentUser}
        links={links}
        unreadCount={unreadCount}
      />

      <main className="staff-main">
        <Routes>
          {isStaff ? (
            <>
              <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="/staff/dashboard" element={<AllIssuesPage />} />
              <Route path="/staff/urgent" element={<UrgentIssuesPage />} />
              <Route path="/notifications" element={<StaffNotificationsPage />} />
              <Route path="/report-issue" element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="/my-issues" element={<Navigate to="/staff/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/my-issues" replace />} />
              <Route path="/report-issue" element={<ReportIssuePage />} />
              <Route path="/my-issues" element={<MyIssuesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/staff/dashboard" element={<Navigate to="/my-issues" replace />} />
              <Route path="/staff/urgent" element={<Navigate to="/my-issues" replace />} />
            </>
          )}

          <Route path="/issues/:id" element={<IssueDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}
