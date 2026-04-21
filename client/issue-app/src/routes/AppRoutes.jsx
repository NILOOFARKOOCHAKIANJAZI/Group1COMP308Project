import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import ReportIssuePage from "../pages/resident/ReportIssuePage";
import MyIssuesPage from "../pages/resident/MyIssuesPage";
import IssueDetailsPage from "../pages/resident/IssueDetailsPage";
import NotificationsPage from "../pages/resident/NotificationsPage";
import NotFoundPage from "../pages/NotFoundPage";
import { GET_NOTIFICATIONS } from "../graphql/queries/notificationQueries";

function Navigation() {
  const location = useLocation();

  const { data } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: "network-only",
    pollInterval: 5000, // auto refresh every 5s
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const links = [
    { to: "/report-issue", label: "Report Issue" },
    { to: "/my-issues", label: "My Issues" },
    { to: "/notifications", label: "Notifications" },
  ];

  return (
    <nav className="top-nav">
      <div className="nav-brand">CivicCase Resident</div>

      <div className="nav-links">
        {links.map((link) => {
          const isNotifications = link.to === "/notifications";

          return (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "nav-link active" : "nav-link"}
              style={{ position: "relative" }}
            >
              {link.label}

              {/* 🔴 Badge */}
              {isNotifications && unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-12px",
                    background: "#e53935",
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: "11px",
                    padding: "2px 6px",
                    fontWeight: "bold",
                    minWidth: "18px",
                    textAlign: "center",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppRoutes() {
  return (
    <div className="app-shell">
      <Navigation />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/report-issue" replace />} />
          <Route path="/report-issue" element={<ReportIssuePage />} />
          <Route path="/my-issues" element={<MyIssuesPage />} />
          <Route path="/issues/:id" element={<IssueDetailsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}