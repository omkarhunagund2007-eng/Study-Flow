import { formatMinutes, pluralize } from '../utils/format.js';

/** Horizontal bars: one row per subject, as long as its share of the biggest subject. */
export default function SubjectBars({ rows }) {
  const max = Math.max(1, ...rows.map((row) => row.minutes));

  return (
    <ul className="hbars">
      {rows.map((row) => (
        <li key={row.subjectId ?? 'none'} className="hbar">
          <div className="hbar__head">
            <span className="subject-tag">
              <span className="subject-tag__dot" style={{ backgroundColor: row.color }} aria-hidden="true" />
              <span className="subject-tag__name">{row.name}</span>
            </span>
            <span className="hbar__value">
              {formatMinutes(row.minutes)} <span className="muted">in {pluralize(row.sessionCount, 'session')}</span>
            </span>
          </div>
          <div className="hbar__track" aria-hidden="true">
            <div className="hbar__fill" style={{ width: `${(row.minutes / max) * 100}%`, backgroundColor: row.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
