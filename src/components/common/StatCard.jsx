export function StatCard({ title, value, subtext, icon: Icon, colorClass = 'blue', highlightText }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon ${colorClass}`}>
          {Icon ? <Icon size={18} /> : null}
        </span>
      </div>
      <strong>{value}</strong>
      <div className="stat-foot">
        {highlightText && <span className="positive">{highlightText} </span>}
        <span>{subtext}</span>
      </div>
    </article>
  );
}

export default StatCard;
