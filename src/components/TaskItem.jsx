import { formatDateShort } from '../utils/dates.js';
import { getTaskState } from '../utils/tasks.js';
import DeadlineBadge from './DeadlineBadge.jsx';
import Icon from './Icon.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import SubjectTag from './SubjectTag.jsx';

/** One row in the task list. It only displays data and calls the functions it is given. */
export default function TaskItem({ task, today, onToggle, onEdit, onDelete }) {
  const state = getTaskState(task, today);

  return (
    <li className={`task task--${state}`}>
      <label className="task__check">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span className="visually-hidden">Mark "{task.title}" as completed</span>
      </label>

      <div className="task__body">
        <h2 className="task__title">{task.title}</h2>
        {task.description && <p className="task__description muted">{task.description}</p>}
        <div className="task__meta">
          <SubjectTag subjectId={task.subjectId} />
          <PriorityBadge priority={task.priority} />
          <span className="task__date">
            <Icon name="calendar" size={16} />
            <time dateTime={task.deadline}>{formatDateShort(task.deadline, today)}</time>
          </span>
          <DeadlineBadge task={task} today={today} />
        </div>
      </div>

      <div className="task__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit(task)} aria-label={`Edit task "${task.title}"`}>
          <Icon name="edit" size={16} />
          <span>Edit</span>
        </button>
        <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => onDelete(task)} aria-label={`Delete task "${task.title}"`}>
          <Icon name="trash" size={16} />
          <span>Delete</span>
        </button>
      </div>
    </li>
  );
}
