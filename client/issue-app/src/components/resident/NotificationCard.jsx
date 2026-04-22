import formatDate from '../../utils/formatDate'

function formatNotificationType(type) {
  return String(type || 'general')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function NotificationCard({ notification, onMarkRead, loadingId }) {
  const isUrgent = notification.type === 'urgent_alert'

  return (
    <div
      className={`card notification-card ${notification.isRead ? 'read' : 'unread'} ${
        isUrgent ? 'notification-urgent' : ''
      }`}
    >
      <div className="notification-top">
        <div>
          <div className="notification-type-row">
            <h3>{formatNotificationType(notification.type)}</h3>
            {isUrgent ? <span className="urgent-pill">Urgent</span> : null}
          </div>
          <p>{notification.message}</p>
        </div>

        {!notification.isRead ? (
          <button
            className="secondary-btn"
            onClick={() => onMarkRead(notification.id)}
            disabled={loadingId === notification.id}
          >
            {loadingId === notification.id ? 'Saving...' : 'Mark as Read'}
          </button>
        ) : null}
      </div>

      <small>{formatDate(notification.createdAt)}</small>
    </div>
  )
}