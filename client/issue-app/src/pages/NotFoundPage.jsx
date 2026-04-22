import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="center-box">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link className="primary-btn" to="/report-issue">
        Go Home
      </Link>
    </div>
  );
}