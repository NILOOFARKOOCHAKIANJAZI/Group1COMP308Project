import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import IssueForm from "../../components/resident/IssueForm";
import { REPORT_ISSUE } from "../../graphql/mutations/issueMutations";
import { CLASSIFY_ISSUE_QUERY } from "../../graphql/queries/analyticsQueries";

const formatLabel = (value) =>
  value
    ? value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "N/A";

export default function ReportIssuePage() {
  const apolloClient = useApolloClient();
  const [reportIssue, { loading, data, error }] = useMutation(REPORT_ISSUE);
  const [classificationError, setClassificationError] = useState("");
  const [createdIssue, setCreatedIssue] = useState(null);

  const handleSubmit = async (input) => {
    try {
      setClassificationError("");
      setCreatedIssue(null);

      let resolvedCategory = input.category || "other";
      let resolvedPriority = input.priority || "medium";
      let aiSummary = "";

      try {
        const { data: classifyData } = await apolloClient.query({
          query: CLASSIFY_ISSUE_QUERY,
          variables: {
            title: input.title,
            description: input.description,
          },
          fetchPolicy: "no-cache",
        });

        const classification = classifyData?.classifyIssue;

        if (classification?.success) {
          resolvedCategory = classification.category || resolvedCategory;
          resolvedPriority = classification.priority || resolvedPriority;
          aiSummary = classification.summary || "";
        } else {
          setClassificationError(
            classification?.message || "AI categorization was unavailable. The issue was still submitted."
          );
        }
      } catch (classifyError) {
        console.error("Issue classification failed:", classifyError.message);
        setClassificationError(
          "AI categorization was unavailable. The issue was still submitted with your selected values."
        );
      }

      const finalInput = {
        ...input,
        category: resolvedCategory,
        priority: resolvedPriority,
        aiCategory: resolvedCategory,
        aiSummary,
      };

      const response = await reportIssue({
        variables: { input: finalInput },
      });

      const savedIssue = response?.data?.reportIssue?.issue || null;
      setCreatedIssue(savedIssue);
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

      {classificationError && (
        <div className="message-card error-card">
          <strong>AI Notice:</strong> {classificationError}
        </div>
      )}

      {error && (
        <div className="message-card error-card">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {createdIssue && (
        <div className="message-card success-card">
          <strong>AI Category:</strong> {formatLabel(createdIssue.aiCategory || createdIssue.category)}
          <br />
          <strong>Priority:</strong> {formatLabel(createdIssue.priority)}
          <br />
          <strong>AI Summary:</strong> {createdIssue.aiSummary || "No AI summary available."}
        </div>
      )}
    </div>
  );
}