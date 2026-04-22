export default function getStatusColor(status) {
  const value = String(status || "").toLowerCase();

  if (value === "reported") return "status-reported";
  if (value === "assigned") return "status-assigned";
  if (value === "in_progress") return "status-progress";
  if (value === "resolved") return "status-resolved";

  return "status-default";
}