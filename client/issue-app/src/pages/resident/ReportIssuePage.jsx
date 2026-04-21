import { useMutation } from "@apollo/client/react";
import IssueForm from "../../components/resident/IssueForm";
import { REPORT_ISSUE } from "../../graphql/mutations/issueMutations";

export default function ReportIssuePage() {
  const [reportIssue, { loading, data, error }] = useMutation(REPORT_ISSUE);

  const handleSubmit = async (input) => {
    try {
      await reportIssue({
        variables: { input },
      });
    } catch (err) {
      console.error("Report issue failed:", err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <IssueForm onSubmit={handleSubmit} loading={loading} />

      {data?.reportIssue && (
        <div className={`message-card ${data.reportIssue.success ? "success-card" : "error-card"}`}>
          <strong>{data.reportIssue.message}</strong>
        </div>
      )}

      {error && (
        <div className="message-card error-card">
          <strong>Error:</strong> {error.message}
        </div>
      )}
    </div>
  );
}