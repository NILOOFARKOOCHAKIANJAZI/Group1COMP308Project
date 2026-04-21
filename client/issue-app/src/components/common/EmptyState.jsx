export default function EmptyState({ title, subtitle }) {
  return (
    <div className="message-card empty-card">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}