import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import formatDate from "../../utils/formatDate";

const formatLabel = (value) =>
  value
    ? value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "N/A";

export default function IssueCard({ issue }) {
  return (
    <div className="card issue-card">
      <div className="issue-card-header">
        <h3>{issue.title}</h3>
        <StatusBadge status={issue.status} />
      </div>

      <p className="issue-text">
        {issue.description?.length > 140
          ? `${issue.description.slice(0, 140)}...`
          : issue.description}
      </p>

      <div className="issue-meta">
        <span><strong>Category:</strong> {formatLabel(issue.category)}</span>
        <span><strong>Priority:</strong> {formatLabel(issue.priority)}</span>
        {issue.urgentAlert && <span><strong>Urgent:</strong> Yes</span>}
      </div>

      <div className="issue-meta">
        <span><strong>Address:</strong> {issue.location?.address || "N/A"}</span>
        <span><strong>Neighborhood:</strong> {issue.location?.neighborhood || "N/A"}</span>
      </div>

      <div className="issue-footer">
        <small>Created: {formatDate(issue.createdAt)}</small>
        <Link className="secondary-btn" to={`/issues/${issue.id}`}>
          View Details
        </Link>
      </div>
    </div>
  );
}