import { pluralize } from '../utils/format.js';

/** One stacked bar: completed / pending / overdue, with a legend that spells out the numbers. */
export default function TaskSplit({ stats }) {
  const pendingOnTime = stats.pending - stats.overdue;
  const parts = [
    { key: 'completed', label: 'Completed', count: stats.completed },
    { key: 'pending', label: 'Pending', count: pendingOnTime },
    { key: 'overdue', label: 'Overdue', count: stats.overdue },
  ];

  return (
    <div>
      <div
        className="split-bar"
        role="img"
        aria-label={`${pluralize(stats.completed, 'task')} completed, ${pendingOnTime} pending, ${stats.overdue} overdue, out of ${stats.total}`}
      >
        {parts.map((part) =>
          part.count > 0 ? (
            <div key={part.key} className={`split-bar__part split-bar__part--${part.key}`} style={{ flexGrow: part.count }} />
          ) : null,
        )}
      </div>
      <ul className="legend">
        {parts.map((part) => (
          <li key={part.key}>
            <span className={`legend__swatch legend__swatch--${part.key}`} aria-hidden="true" />
            {part.label}: <strong>{part.count}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
