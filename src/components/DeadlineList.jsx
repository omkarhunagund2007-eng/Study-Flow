import DeadlineBadge from './DeadlineBadge.jsx';
import SubjectTag from './SubjectTag.jsx';
import { formatDateShort } from '../utils/dates.js';

/** Compact list of tasks with their deadlines (used on the dashboard). */
export default function DeadlineList({ tasks, today }) {
  return (
    <ul className="deadline-list">
      {tasks.map((task) => (
        <li key={task.id} className="deadline-item">
          <div className="deadline-item__main">
            <p className="deadline-item__title">{task.title}</p>
            <p className="deadline-item__meta muted">
              <SubjectTag subjectId={task.subjectId} />
              <time dateTime={task.deadline}>{formatDateShort(task.deadline, today)}</time>
            </p>
          </div>
          <DeadlineBadge task={task} today={today} />
        </li>
      ))}
    </ul>
  );
}
