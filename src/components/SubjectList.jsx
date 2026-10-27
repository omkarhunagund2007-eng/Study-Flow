import { formatMinutes, pluralize } from '../utils/format.js';
import Icon from './Icon.jsx';

/** One card per subject, with how many tasks and how much study time it has. */
export default function SubjectList({ subjects, tasks, sessions, editingId, onEdit, onDelete }) {
  return (
    <ul className="subject-list" aria-label="Subjects">
      {subjects.map((subject) => {
        const subjectTasks = tasks.filter((task) => task.subjectId === subject.id);
        const pending = subjectTasks.filter((task) => !task.completed).length;
        const minutes = sessions
          .filter((session) => session.subjectId === subject.id)
          .reduce((total, session) => total + session.durationMin, 0);

        return (
          <li key={subject.id} className={`subject-card card${editingId === subject.id ? ' subject-card--editing' : ''}`}>
            <span className="subject-card__color" style={{ backgroundColor: subject.color }} aria-hidden="true" />
            <div className="subject-card__body">
              <h3>{subject.name}</h3>
              <p className="muted">
                {pluralize(subjectTasks.length, 'task')} ({pending} pending). Studied {formatMinutes(minutes)}.
              </p>
            </div>
            <div className="subject-card__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit(subject)} aria-label={`Edit subject "${subject.name}"`}>
                <Icon name="edit" size={16} />
                <span>Edit</span>
              </button>
              <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => onDelete(subject)} aria-label={`Delete subject "${subject.name}"`}>
                <Icon name="trash" size={16} />
                <span>Delete</span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
