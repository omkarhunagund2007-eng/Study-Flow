import { formatDateTime, formatMinutesLabel } from '../utils/format.js';
import SubjectTag from './SubjectTag.jsx';

/** List of recorded focus sessions (already sorted newest first by the caller). */
export default function SessionHistory({ sessions }) {
  return (
    <ul className="history">
      {sessions.map((session) => (
        <li key={session.id} className="history__item">
          <SubjectTag subjectId={session.subjectId} />
          <span className="history__minutes">{formatMinutesLabel(session.durationMin)}</span>
          <time className="history__time muted" dateTime={session.completedAt}>
            {formatDateTime(session.completedAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}
