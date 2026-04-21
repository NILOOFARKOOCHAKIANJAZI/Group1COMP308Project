import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_NOTIFICATIONS } from "../../graphql/queries/notificationQueries";
import { MARK_NOTIFICATION_AS_READ } from "../../graphql/mutations/notificationMutations";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import NotificationList from "../../components/resident/NotificationList";

export default function NotificationsPage() {
  const [loadingId, setLoadingId] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: "network-only",
  });

  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);

  const handleMarkRead = async (notificationId) => {
    try {
      setLoadingId(notificationId);

      await markNotificationAsRead({
        variables: { notificationId },
      });

      await refetch();
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  const notifications = data?.notifications || [];

  if (!notifications.length) {
    return (
      <EmptyState
        title="No notifications"
        subtitle="You do not have any notifications yet."
      />
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Stay updated on your issue status and urgent alerts.</p>
      </div>

      <NotificationList
        notifications={notifications}
        onMarkRead={handleMarkRead}
        loadingId={loadingId}
      />
    </div>
  );
}