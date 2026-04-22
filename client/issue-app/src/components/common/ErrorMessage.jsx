export default function ErrorMessage({ message = "Something went wrong." }) {
  return (
    <div className="message-card error-card">
      <strong>Error:</strong> {message}
    </div>
  );
}