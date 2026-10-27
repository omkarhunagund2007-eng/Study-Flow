import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dailyTotals,
  minutesBySubject,
  minutesOnDate,
  sortSessionsNewestFirst,
  sumMinutes,
  weeklyMinutes,
  weeklySessionCount,
} from '../src/utils/study.js';

const today = '2026-10-27';
// Build timestamps in LOCAL time so the tests pass in every time zone.
const at = (month, day, hour = 12, minute = 0) => new Date(2026, month - 1, day, hour, minute).toISOString();
const session = (id, subjectId, durationMin, completedAt) => ({ id, subjectId, durationMin, completedAt });

const subjects = [
  { id: 'math', name: 'Math', color: '#6366f1' },
  { id: 'phys', name: 'Physics', color: '#0d9488' },
];
const sessions = [
  session('1', 'math', 25, at(10, 27, 9)), // today
  session('2', 'math', 25, at(10, 27, 15)), // today
  session('3', 'phys', 50, at(10, 26)), // yesterday
  session('4', 'phys', 30, at(10, 21)), // 6 days ago -> still inside the 7-day window
  session('5', 'math', 40, at(10, 20)), // 7 days ago -> outside the window
  session('6', 'deleted-subject', 15, at(10, 25)),
  session('7', null, 10, at(10, 24, 23, 59)), // late evening still counts for the 24th
];

test('sumMinutes adds up durations (and is 0 for no sessions)', () => {
  assert.equal(sumMinutes(sessions), 195);
  assert.equal(sumMinutes([]), 0);
});

test('minutesOnDate counts only that local day', () => {
  assert.equal(minutesOnDate(sessions, today), 50);
  assert.equal(minutesOnDate(sessions, '2026-10-24'), 10);
  assert.equal(minutesOnDate(sessions, '2026-10-01'), 0);
});

test('dailyTotals returns seven days oldest first, including empty days', () => {
  const days = dailyTotals(sessions, 7, today);
  assert.equal(days.length, 7);
  assert.equal(days[0].date, '2026-10-21');
  assert.equal(days[6].date, today);
  assert.deepEqual(days.map((day) => day.minutes), [30, 0, 0, 10, 15, 50, 50]);
  assert.deepEqual(days.map((day) => day.sessionCount), [1, 0, 0, 1, 1, 1, 2]);
});

test('weekly study time is the sum of the last 7 days (today included)', () => {
  assert.equal(weeklyMinutes(sessions, today), 155);
  assert.equal(weeklySessionCount(sessions, today), 6);
});

test('weekly time is 0 with no data', () => {
  assert.equal(weeklyMinutes([], today), 0);
  assert.equal(weeklySessionCount([], today), 0);
});

test('minutesBySubject groups, sorts by minutes, and uses "No subject" for unknown ones', () => {
  const result = minutesBySubject(sessions, subjects);
  assert.deepEqual(result.map((row) => [row.name, row.minutes, row.sessionCount]), [
    ['Math', 90, 3],
    ['Physics', 80, 2],
    ['No subject', 25, 2], // the deleted subject and the null subject are grouped together
  ]);
});

test('minutesBySubject with no sessions is an empty list', () => {
  assert.deepEqual(minutesBySubject([], subjects), []);
});

test('sortSessionsNewestFirst does not change the original array', () => {
  const copy = [...sessions];
  const sorted = sortSessionsNewestFirst(sessions);
  assert.equal(sorted[0].id, '2');
  assert.deepEqual(sessions, copy);
});
