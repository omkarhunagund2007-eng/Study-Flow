import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTaskStats,
  DEFAULT_FILTERS,
  filterAndSortTasks,
  getDeadlineList,
  getTaskState,
  hasActiveFilters,
} from '../src/utils/tasks.js';

const today = '2026-10-27';
const make = (id, overrides = {}) => ({
  id,
  title: `Task ${id}`,
  description: '',
  subjectId: null,
  deadline: today,
  priority: 'medium',
  completed: false,
  ...overrides,
});

const tasks = [
  make('a', { title: 'Algebra homework', subjectId: 'math', deadline: '2026-10-25', priority: 'high' }), // overdue
  make('b', { title: 'Read history notes', subjectId: 'hist', deadline: today, priority: 'low' }), // today
  make('c', { title: 'Lab report', subjectId: 'phys', deadline: '2026-10-30', priority: 'high' }), // this week
  make('d', { title: 'Essay draft', subjectId: 'hist', deadline: '2026-11-20', priority: 'medium' }), // later
  make('e', { title: 'Algebra quiz prep', subjectId: 'math', deadline: '2026-10-20', completed: true }), // done, old date
  make('f', { title: 'Free reading', subjectId: null, deadline: '2026-11-02', priority: 'low' }), // no subject
];

const ids = (list) => list.map((task) => task.id);

test('getTaskState: completed tasks are never overdue', () => {
  assert.equal(getTaskState(tasks[4], today), 'completed');
  assert.equal(getTaskState(tasks[0], today), 'overdue');
  assert.equal(getTaskState(tasks[1], today), 'today');
  assert.equal(getTaskState(tasks[2], today), 'upcoming');
});

test('default filters return everything sorted by deadline (earliest first)', () => {
  assert.deepEqual(ids(filterAndSortTasks(tasks, DEFAULT_FILTERS, today)), ['e', 'a', 'b', 'c', 'f', 'd']);
});

test('sorting can be reversed', () => {
  const result = filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, sort: 'deadline-desc' }, today);
  assert.deepEqual(ids(result), ['d', 'f', 'c', 'b', 'a', 'e']);
});

test('sorting does not change the original array', () => {
  const copy = [...tasks];
  filterAndSortTasks(tasks, DEFAULT_FILTERS, today);
  assert.deepEqual(tasks, copy);
});

test('search matches the title, ignoring case and surrounding spaces', () => {
  assert.deepEqual(ids(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, search: '  ALGEBRA ' }, today)), ['e', 'a']);
  assert.deepEqual(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, search: 'zzz' }, today), []);
});

test('subject filter supports a subject, "none" and "all"', () => {
  assert.deepEqual(ids(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, subject: 'hist' }, today)), ['b', 'd']);
  assert.deepEqual(ids(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, subject: 'none' }, today)), ['f']);
});

test('priority and status filters work', () => {
  assert.deepEqual(ids(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, priority: 'high' }, today)), ['a', 'c']);
  assert.deepEqual(ids(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, status: 'completed' }, today)), ['e']);
  assert.deepEqual(ids(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, status: 'pending' }, today)), ['a', 'b', 'c', 'f', 'd']);
});

test('deadline filters: overdue, today, next 7 days, later', () => {
  const run = (deadline) => ids(filterAndSortTasks(tasks, { ...DEFAULT_FILTERS, deadline }, today));
  assert.deepEqual(run('overdue'), ['a']); // the completed old task is NOT overdue
  assert.deepEqual(run('today'), ['b']);
  assert.deepEqual(run('week'), ['b', 'c', 'f']); // 27 Oct up to and including 3 Nov
  assert.deepEqual(run('later'), ['d']);
});

test('search, filters and sorting combine (all must match)', () => {
  const filters = { ...DEFAULT_FILTERS, search: 'algebra', subject: 'math', status: 'pending', priority: 'high' };
  assert.deepEqual(ids(filterAndSortTasks(tasks, filters, today)), ['a']);
  assert.deepEqual(filterAndSortTasks(tasks, { ...filters, priority: 'low' }, today), []);
});

test('equal deadlines are ordered by priority, then title', () => {
  const sameDay = [
    make('x', { title: 'Zebra', priority: 'low' }),
    make('y', { title: 'Apple', priority: 'low' }),
    make('z', { title: 'Mango', priority: 'high' }),
  ];
  assert.deepEqual(ids(filterAndSortTasks(sameDay, DEFAULT_FILTERS, today)), ['z', 'y', 'x']);
});

test('hasActiveFilters ignores sorting and blank search', () => {
  assert.equal(hasActiveFilters(DEFAULT_FILTERS), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, sort: 'deadline-desc' }), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, search: '   ' }), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, search: 'a' }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, priority: 'low' }), true);
});

test('computeTaskStats counts everything from the real task list', () => {
  assert.deepEqual(computeTaskStats(tasks, today), {
    total: 6, completed: 1, pending: 5, overdue: 1, dueToday: 1, completionPercent: 17,
  });
});

test('computeTaskStats handles an empty list without dividing by zero', () => {
  assert.deepEqual(computeTaskStats([], today), {
    total: 0, completed: 0, pending: 0, overdue: 0, dueToday: 0, completionPercent: 0,
  });
});

test('completion percentage is 100 when everything is done', () => {
  assert.equal(computeTaskStats([make('1', { completed: true }), make('2', { completed: true })], today).completionPercent, 100);
});

test('getDeadlineList: pending only, chronological, overdue first, with a limit', () => {
  assert.deepEqual(ids(getDeadlineList(tasks, today)), ['a', 'b', 'c', 'f', 'd']);
  assert.deepEqual(ids(getDeadlineList(tasks, today, 2)), ['a', 'b']);
});
