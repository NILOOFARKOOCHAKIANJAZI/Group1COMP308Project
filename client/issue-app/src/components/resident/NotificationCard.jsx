import formatDate from "../../utils/formatDate";

export default function NotificationCard({ notification, onMarkRead, loadingId }) {
  return (
    <div className={`card notification-card ${notification.isRead ? "read" : "unread"}`}>
      <div className="notification-top">
        <div>
          <h3>{notification.type.replaceAll("_", " ")}</h3>
          <p>{notification.message}</p>
        </div>

        {!notification.isRead && (
          <button
            className="secondary-btn"
            onClick={() => onMarkRead(notification.id)}
            disabled={loadingId === notification.id}
          >
            {loadingId === notification.id ? "Saving..." : "Mark as Read"}
          </button>
        )}
      </div>

      <small>{formatDate(notification.createdAt)}</small>
    </div>
  );
}