import formatDate from '../../utils/formatDate'

const TYPE_LABELS = {
  status_update: 'Status update',
  urgent_alert: 'Urgent alert',
  assignment: 'Assignment',
  general: 'General',
}

const TYPE_CLASS = {
  status_update: 'notif-card--type-status',
  urgent_alert: 'notif-card--type-urgent',
  assignment: 'notif-card--type-assignment',
  general: 'notif-card--type-general',
}

function TypeIcon({ type }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (type === 'status_update') {
    return (
      <svg {...props}>
        <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.7 1 6.4 2.6" />
        <polyline points="21 4 21 10 15 10" />
      </svg>
    )
  }

  if (type === 'urgent_alert') {
    return (
      <svg {...props}>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    )
  }

  if (type === 'assignment') {
    return (
      <svg {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

export default function NotificationCard({ notification, onMarkRead, loadingId }) {
  const type = notification.type || 'general'
  const isUrgent = type === 'urgent_alert'
  const isUnread = !notification.isRead

  const cardClass = [
    'notif-card',
    isUnread ? 'notif-card--unread' : 'notif-card--read',
    isUrgent ? 'notif-card--urgent' : '',
    TYPE_CLASS[type] || TYPE_CLASS.general,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cardClass}>
      <div className="notif-card__icon" aria-hidden="true">
        <TypeIcon type={type} />
      </div>

      <div className="notif-card__body">
        <div className="notif-card__head">
          <span className="notif-card__type">{TYPE_LABELS[type] || 'General'}</span>
          {isUnread && (
            <span className="notif-card__dot" aria-label="Unread notification" />
          )}
          <span className="notif-card__time">{formatDate(notification.createdAt)}</span>
        </div>

        <p className="notif-card__message">{notification.message}</p>

        {isUnread && (
          <div className="notif-card__actions">
            <button
              type="button"
              className="notif-card__action"
              onClick={() => onMarkRead(notification.id)}
              disabled={loadingId === notification.id}
            >
              {loadingId === notification.id ? 'Saving...' : 'Mark as read'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
