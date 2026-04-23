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

      const userPickedCategory = Boolean(input.category);
      const userPickedPriority = Boolean(input.priority);

      let aiCategory = "";
      let aiPriority = "";
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
          aiCategory = classification.category || "";
          aiPriority = classification.priority || "";
          aiSummary = classification.summary || "";
        } else {
          setClassificationError(
            classification?.message || "AI categorization was unavailable. The issue was still submitted with your selections."
          );
        }
      } catch (classifyError) {
        console.error("Issue classification failed:", classifyError.message);
        setClassificationError(
          "AI categorization was unavailable. The issue was still submitted with your selections."
        );
      }

      const finalCategory = userPickedCategory
        ? input.category
        : (aiCategory || "other");

      const finalPriority = userPickedPriority
        ? input.priority
        : (aiPriority || "medium");

      const finalInput = {
        ...input,
        category: finalCategory,
        priority: finalPriority,
        aiCategory,
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
          <strong>Category:</strong> {formatLabel(createdIssue.category)}
          {createdIssue.aiCategory && createdIssue.aiCategory !== createdIssue.category && (
            <span> (AI suggested {formatLabel(createdIssue.aiCategory)})</span>
          )}
          <br />
          <strong>Priority:</strong> {formatLabel(createdIssue.priority)}
          {createdIssue.aiSummary && (
            <>
              <br />
              <strong>AI Summary:</strong> {createdIssue.aiSummary}
            </>
          )}
        </div>
      )}
    </div>
  );
}
