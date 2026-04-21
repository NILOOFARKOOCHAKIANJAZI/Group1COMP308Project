export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="center-box">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}