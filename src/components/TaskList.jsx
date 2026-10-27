import TaskItem from './TaskItem.jsx';

/** Turns an array of tasks into a list. `key` must be stable and unique: the task id. */
export default function TaskList({ tasks, today, onToggle, onEdit, onDelete }) {
  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} today={today} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
