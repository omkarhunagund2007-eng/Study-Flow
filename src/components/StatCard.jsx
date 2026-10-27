import Icon from './Icon.jsx';

/** One number with a label, e.g. "Pending tasks 5". Must be placed inside a <dl>. */
export default function StatCard({ label, value, icon, tone = 'neutral', hint }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <dt className="stat-card__label">
        <Icon name={icon} size={18} />
        <span>{label}</span>
      </dt>
      <dd className="stat-card__value">{value}</dd>
      {hint && <dd className="stat-card__hint muted">{hint}</dd>}
    </div>
  );
}
