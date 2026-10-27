import Icon from './Icon.jsx';

/** Friendly message shown instead of an empty list. `action` is an optional button/link. */
export default function EmptyState({ icon = 'list', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon name={icon} size={28} />
      </div>
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {action}
    </div>
  );
}
