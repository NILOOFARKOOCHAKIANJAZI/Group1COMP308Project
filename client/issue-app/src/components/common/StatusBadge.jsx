import getStatusColor from "../../utils/getStatusColor";

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${getStatusColor(status)}`}>
      {String(status || "unknown")}
    </span>
  );
}