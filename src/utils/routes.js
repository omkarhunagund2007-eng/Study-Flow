// The five pages. The URL part after "#/" decides which page is shown,
// e.g. "index.html#/tasks" shows the Tasks page. Using the hash means we need
// no extra routing library and the app works on any static host.

export const ROUTES = [
  { path: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: 'dashboard' },
  { path: 'tasks', label: 'Tasks', shortLabel: 'Tasks', icon: 'tasks' },
  { path: 'subjects', label: 'Subjects', shortLabel: 'Subjects', icon: 'subjects' },
  { path: 'timer', label: 'Study Timer', shortLabel: 'Timer', icon: 'timer' },
  { path: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: 'analytics' },
];

/** "#/tasks" -> "tasks". Anything unknown falls back to the dashboard. */
export function getRouteFromHash(hash) {
  const match = /^#\/([a-z]+)\/?$/.exec(hash || '');
  const path = match ? match[1] : '';
  return ROUTES.some((route) => route.path === path) ? path : 'dashboard';
}
