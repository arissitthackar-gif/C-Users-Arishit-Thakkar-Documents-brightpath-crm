export function StatusBadge({ status }) {
  if (!status) return null;
  const normalized = String(status).toLowerCase().replace(/\s+/g, '-');

  return (
    <span className={`status-badge badge-${normalized}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
