import { addDays } from './dates.js';
import { PRIORITY_RANK } from './constants.js';

// Pure functions about tasks: they take data in and return new data.
// They never touch React or the browser, which makes them easy to test.

export const DEFAULT_FILTERS = {
  search: '',
  subject: 'all', // 'all' | 'none' | a subject id
  priority: 'all', // 'all' | 'high' | 'medium' | 'low'
  status: 'all', // 'all' | 'pending' | 'completed'
  deadline: 'all', // 'all' | 'overdue' | 'today' | 'week' | 'later'
  sort: 'deadline-asc', // 'deadline-asc' | 'deadline-desc'
};

/**
 * The one place that decides what state a task is in.
 *  completed - done (never overdue, even if the date has passed)
 *  overdue   - not done and the deadline is before today
 *  today     - not done and due today
 *  upcoming  - not done and due later
 * Comparing the "YYYY-MM-DD" strings directly works because they sort like dates.
 */
export function getTaskState(task, today) {
  if (task.completed) return 'completed';
  if (task.deadline < today) return 'overdue';
  if (task.deadline === today) return 'today';
  return 'upcoming';
}

function matchesDeadlineFilter(task, filter, today) {
  switch (filter) {
    case 'overdue':
      return getTaskState(task, today) === 'overdue';
    case 'today':
      return task.deadline === today;
    case 'week':
      return task.deadline >= today && task.deadline <= addDays(today, 7);
    case 'later':
      return task.deadline > addDays(today, 7);
    default:
      return true;
  }
}

/** Applies search + every filter together, then sorts. Returns a NEW array. */
export function filterAndSortTasks(tasks, filters, today) {
  const query = filters.search.trim().toLowerCase();

  const matches = tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query)) return false;

    if (filters.subject === 'none') {
      if (task.subjectId) return false;
    } else if (filters.subject !== 'all' && task.subjectId !== filters.subject) {
      return false;
    }

    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.status === 'pending' && task.completed) return false;
    if (filters.status === 'completed' && !task.completed) return false;

    return matchesDeadlineFilter(task, filters.deadline, today);
  });

  const direction = filters.sort === 'deadline-desc' ? -1 : 1;

  // [...matches] copies the array first: sort() changes the array it is called on,
  // and we never want to change React state directly.
  return [...matches].sort((a, b) => {
    if (a.deadline !== b.deadline) return a.deadline < b.deadline ? -direction : direction;
    return (
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id)
    );
  });
}

/** True when any search/filter differs from its default (sorting is not a filter). */
export function hasActiveFilters(filters) {
  return ['search', 'subject', 'priority', 'status', 'deadline'].some((key) =>
    key === 'search' ? filters.search.trim() !== '' : filters[key] !== DEFAULT_FILTERS[key],
  );
}

/** Every number on the dashboard comes from here - nothing is hard-coded. */
export function computeTaskStats(tasks, today) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter((task) => getTaskState(task, today) === 'overdue').length;
  const dueToday = tasks.filter((task) => getTaskState(task, today) === 'today').length;
  const completionPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, pending, overdue, dueToday, completionPercent };
}

/**
 * Pending tasks in date order: overdue ones come first (their dates are the
 * oldest), then today, then later. `limit` keeps dashboard lists short.
 */
export function getDeadlineList(tasks, today, limit = Infinity) {
  return filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, status: 'pending' }, today).slice(0, limit);
}
