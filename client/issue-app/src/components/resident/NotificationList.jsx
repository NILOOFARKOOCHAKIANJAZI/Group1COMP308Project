import NotificationCard from "./NotificationCard";

export default function NotificationList({ notifications, onMarkRead, loadingId }) {
  return (
    <div className="list-grid">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          loadingId={loadingId}
        />
      ))}
    </div>
  );
}