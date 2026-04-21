import { useQuery } from "@apollo/client/react";
import { MY_ISSUES } from "../../graphql/queries/issueQueries";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import IssueList from "../../components/resident/IssueList";

export default function MyIssuesPage() {
  const { data, loading, error } = useQuery(MY_ISSUES, {
    fetchPolicy: "network-only",
  });

  if (loading) {
    return <LoadingSpinner text="Loading your issues..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  const issues = Array.isArray(data?.myIssues) ? data.myIssues : [];

  if (!issues.length) {
    return (
      <EmptyState
        title="No issues found"
        subtitle="You have not reported any issues yet."
      />
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>My Issues</h1>
        <p>Track the issues you have reported.</p>
      </div>

      <IssueList issues={issues} />
    </div>
  );
}