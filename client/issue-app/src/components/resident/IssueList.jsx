import IssueCard from "./IssueCard";

export default function IssueList({ issues }) {
  return (
    <div className="list-grid">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}