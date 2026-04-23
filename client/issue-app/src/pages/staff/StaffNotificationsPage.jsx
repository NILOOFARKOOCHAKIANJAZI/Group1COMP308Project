import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { CURRENT_USER_QUERY } from '../../graphql/queries/userQueries'
import useStaffNotifications from '../../hooks/useStaffNotifications'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import EmptyState from '../../components/common/EmptyState'
import NotificationCard from '../../components/resident/NotificationCard'

const TYPE_ORDER = ['urgent_alert', 'general']

function formatLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function StaffNotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const { data: userData } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'cache-first',
  })

  const currentUser = userData?.currentUser
  const userId = currentUser?.id

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    error,
  } = useStaffNotifications({
    userId,
    enabled: Boolean(userId),
  })

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
    }),
    [notifications, unreadCount],
  )

  const typeBreakdown = useMemo(() => {
    return TYPE_ORDER.map((type) => ({
      type,
      count: notifications.filter((n) => n.type === type).length,
    })).filter((item) => item.count > 0)
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications
    if (activeFilter === 'unread') return notifications.filter((n) => !n.isRead)
    return notifications.filter((n) => n.type === activeFilter)
  }, [notifications, activeFilter])

  if (loading && notifications.length === 0) {
    return <LoadingSpinner text="Loading notifications..." />
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  if (!notifications.length) {
    return (
      <EmptyState
        title="No notifications"
        subtitle="You do not have any notifications yet. New community reports will appear here."
      />
    )
  }

  const maxTypeCount = typeBreakdown.length > 0
    ? Math.max(...typeBreakdown.map((t) => t.count))
    : 0

  return (
    <div className="staff-main staff-detail-page">
      <div className="staff-page-header">
        <div className="staff-page-header__title-group">
          <h1 className="staff-page-header__title">Notifications and alerts</h1>
          <span className="staff-page-header__subtitle">
            Stay on top of new community reports as residents submit them.
          </span>
        </div>
      </div>

      <div className="staff-stats">
        <div className="staff-stat staff-stat--urgent">
          <span className="staff-stat__label">Unread</span>
          <span className="staff-stat__value">{stats.unread}</span>
        </div>
        <div className="staff-stat staff-stat--resolved">
          <span className="staff-stat__label">Read</span>
          <span className="staff-stat__value">{stats.read}</span>
        </div>
        <div className="staff-stat">
          <span className="staff-stat__label">Total</span>
          <span className="staff-stat__value">{stats.total}</span>
        </div>
      </div>

      <div className="staff-filter-chips" role="tablist" aria-label="Filter notifications">
        <div className="staff-filter-chips__group">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'all'}
            className={`staff-filter-chip ${activeFilter === 'all' ? 'staff-filter-chip--active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All <span className="staff-filter-chip__count">{stats.total}</span>
          </button>
          {stats.unread > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'unread'}
              className={`staff-filter-chip ${activeFilter === 'unread' ? 'staff-filter-chip--active' : ''}`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread <span className="staff-filter-chip__count">{stats.unread}</span>
            </button>
          )}
          {typeBreakdown.map(({ type, count }) => {
            const isActive = activeFilter === type
            return (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`staff-filter-chip ${isActive ? 'staff-filter-chip--active' : ''}`}
                onClick={() => setActiveFilter(type)}
              >
                {formatLabel(type)} <span className="staff-filter-chip__count">{count}</span>
              </button>
            )
          })}
        </div>
        {stats.unread > 0 && (
          <button
            type="button"
            className="staff-btn staff-btn--ghost"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notif-layout">
        <div className="notif-list">
          {filteredNotifications.length === 0 ? (
            <div className="staff-empty">
              <span className="staff-empty__title">No notifications match this filter</span>
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="staff-btn staff-btn--ghost"
                  onClick={() => setActiveFilter('all')}
                >
                  Show all
                </button>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                loadingId={null}
              />
            ))
          )}
        </div>

        <aside className="notif-aside">
          <section className="staff-card">
            <div className="staff-card__head">
              <div className="staff-card__title">By type</div>
            </div>
            <div className="staff-card__body">
              {typeBreakdown.length === 0 ? (
                <div className="notif-breakdown__empty">No notifications yet.</div>
              ) : (
                <div className="notif-breakdown">
                  {typeBreakdown.map(({ type, count }) => {
                    const pct = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0
                    return (
                      <div
                        key={type}
                        className={`notif-breakdown-row notif-breakdown-row--${type}`}
                      >
                        <div className="notif-breakdown-row__head">
                          <span className="notif-breakdown-row__label">
                            {formatLabel(type)}
                          </span>
                          <span className="notif-breakdown-row__count">{count}</span>
                        </div>
                        <div className="notif-breakdown-bar">
                          <div
                            className="notif-breakdown-bar__fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
