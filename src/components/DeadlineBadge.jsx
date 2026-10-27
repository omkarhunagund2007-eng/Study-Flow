import { describeDeadline } from '../utils/dates.js';
import { getTaskState } from '../utils/tasks.js';
import Badge from './Badge.jsx';

/** "Overdue by 2 days", "Due today", "Due in 3 days" or "Completed". */
export default function DeadlineBadge({ task, today }) {
  const state = getTaskState(task, today);
  if (state === 'completed') return <Badge tone="success">Completed</Badge>;
  const tone = state === 'overdue' ? 'danger' : state === 'today' ? 'warning' : 'neutral';
  return <Badge tone={tone}>{describeDeadline(task.deadline, today)}</Badge>;
}
