import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { ISSUE_BY_ID } from "../../graphql/queries/issueQueries";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import StatusBadge from "../../components/common/StatusBadge";
import formatDate from "../../utils/formatDate";

// helper to format labels nicely
const formatLabel = (value) =>
  value
    ? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "N/A";

export default function IssueDetailsPage() {
  const { id } = useParams();

  const { data, loading, error } = useQuery(ISSUE_BY_ID, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  if (loading) {
    return <LoadingSpinner text="Loading issue details..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  const issue = data?.issueById;

  if (!issue) {
    return <ErrorMessage message="Issue not found." />;
  }

  return (
    <div className="page-wrapper">
      <div className="card details-card">
        
        {/* HEADER */}
        <div className="details-header">
          <h1>{issue.title}</h1>
          <StatusBadge status={issue.status} />
        </div>

        {/* URGENT ALERT */}
        {issue.urgentAlert && (
          <div style={{ color: "#b91c1c", fontWeight: "bold", marginBottom: "10px" }}>
            🚨 Urgent Issue
          </div>
        )}

        {/* IMAGE */}
        {issue.photoUrl && (
          <div className="details-section">
            <img
              className="issue-photo"
              src={issue.photoUrl}
              alt={issue.title}
            />
          </div>
        )}

        {/* DESCRIPTION */}
        <p className="issue-text">{issue.description}</p>

        {/* DETAILS GRID */}
        <div className="details-grid">
          <div><strong>Category:</strong> {formatLabel(issue.category)}</div>
          <div><strong>AI Category:</strong> {formatLabel(issue.aiCategory)}</div>
          <div><strong>Priority:</strong> {formatLabel(issue.priority)}</div>
          <div><strong>Reported By:</strong> {issue.reportedByUsername}</div>
          <div><strong>Assigned To:</strong> {issue.assignedToUsername || "Not assigned"}</div>
          <div><strong>Address:</strong> {issue.location?.address || "N/A"}</div>
          <div><strong>Neighborhood:</strong> {issue.location?.neighborhood || "N/A"}</div>
          <div><strong>Latitude:</strong> {issue.location?.latitude ?? "N/A"}</div>
          <div><strong>Longitude:</strong> {issue.location?.longitude ?? "N/A"}</div>
          <div><strong>Created:</strong> {formatDate(issue.createdAt)}</div>
          <div><strong>Updated:</strong> {formatDate(issue.updatedAt)}</div>
        </div>

        {/* AI SUMMARY */}
        {issue.aiSummary && (
          <div className="details-section">
            <h3>AI Summary</h3>
            <p>{issue.aiSummary}</p>
          </div>
        )}

        {/* INTERNAL NOTES */}
        {issue.internalNotes && (
          <div className="details-section">
            <h3>Internal Notes</h3>
            <p>{issue.internalNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}