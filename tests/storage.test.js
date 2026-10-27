import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadValue, saveValue } from '../src/utils/storage.js';
import {
  sanitizePreferences,
  sanitizeSessions,
  sanitizeSubjects,
  sanitizeTasks,
  sanitizeTimer,
} from '../src/utils/sanitize.js';
import { getRouteFromHash } from '../src/utils/routes.js';

// A tiny fake LocalStorage so these tests can run in plain Node.
let store;
function installFakeStorage({ failWrites = false, failReads = false } = {}) {
  store = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem(key) {
        if (failReads) throw new Error('blocked');
        return store.has(key) ? store.get(key) : null;
      },
      setItem(key, value) {
        if (failWrites) throw new Error('quota exceeded');
        store.set(key, String(value));
      },
    },
  });
}
beforeEach(() => installFakeStorage());

test('a value that was never saved reports "missing" and returns the fallback', () => {
  assert.deepEqual(loadValue('k', ['fallback'], sanitizeTasks), { value: ['fallback'], status: 'missing' });
});

test('saved data round-trips', () => {
  const tasks = [{ id: 't1', title: 'A', description: '', subjectId: null, deadline: '2026-10-27', priority: 'low', completed: false, createdAt: new Date().toISOString(), completedAt: null }];
  assert.equal(saveValue('tasks', tasks), true);
  const loaded = loadValue('tasks', [], sanitizeTasks);
  assert.equal(loaded.status, 'ok');
  assert.deepEqual(loaded.value, tasks);
});

test('invalid JSON is survived: fallback returned, status "corrupt", backup kept', () => {
  store.set('tasks', '{not json!!');
  const loaded = loadValue('tasks', [], sanitizeTasks);
  assert.deepEqual(loaded, { value: [], status: 'corrupt' });
  assert.equal(store.get('tasks.backup'), '{not json!!');
});

test('valid JSON of the wrong shape counts as corrupt', () => {
  store.set('tasks', JSON.stringify({ not: 'an array' }));
  assert.equal(loadValue('tasks', [], sanitizeTasks).status, 'corrupt');
  store.set('tasks', 'null');
  assert.equal(loadValue('tasks', [], sanitizeTasks).status, 'corrupt');
});

test('broken items are dropped, good ones are kept, status "repaired"', () => {
  const good = { id: 't1', title: 'Good', deadline: '2026-10-27', priority: 'high', completed: false };
  store.set('tasks', JSON.stringify([good, { id: 't2' }, 'junk', null, { id: 't3', title: 'Bad date', deadline: '2026-02-30' }, { ...good }]));
  const loaded = loadValue('tasks', [], sanitizeTasks);
  assert.equal(loaded.status, 'repaired');
  assert.equal(loaded.value.length, 1); // duplicates of the same id are collapsed too
  assert.equal(loaded.value[0].title, 'Good');
  assert.equal(loaded.value[0].description, '');
  assert.ok(store.has('tasks.backup'));
});

test('unknown priority falls back to medium instead of dropping the task', () => {
  const result = sanitizeTasks([{ id: 'a', title: 'T', deadline: '2026-10-27', priority: 'urgent' }]);
  assert.equal(result.value[0].priority, 'medium');
  assert.equal(result.dropped, 0);
});

test('blocked storage does not crash: reads fall back, writes report failure', () => {
  installFakeStorage({ failReads: true, failWrites: true });
  assert.deepEqual(loadValue('k', 5, null), { value: 5, status: 'unavailable' });
  assert.equal(saveValue('k', 5), false);
});

test('a full storage (write error) is reported as false, not thrown', () => {
  installFakeStorage({ failWrites: true });
  assert.equal(saveValue('k', { a: 1 }), false);
});

test('sanitizeSubjects fixes bad colors and drops nameless subjects', () => {
  const result = sanitizeSubjects([{ id: 's1', name: '  Math  ', color: 'not-a-color' }, { id: 's2', name: '' }]);
  assert.equal(result.value.length, 1);
  assert.equal(result.value[0].name, 'Math');
  assert.equal(result.value[0].color, '#6366f1');
  assert.equal(result.dropped, 1);
});

test('sanitizeSessions drops invalid dates and impossible durations', () => {
  const good = { id: 'a', subjectId: null, durationMin: 25, completedAt: new Date().toISOString() };
  const result = sanitizeSessions([good, { ...good, id: 'b', completedAt: 'nope' }, { ...good, id: 'c', durationMin: -5 }, { ...good, id: 'd', durationMin: 'abc' }, { ...good, id: 'e', durationMin: 99999 }]);
  assert.deepEqual(result.value, [good]);
  assert.equal(result.dropped, 4);
});

test('sanitizePreferences keeps valid values and repairs invalid ones', () => {
  assert.equal(sanitizePreferences('text'), null);
  const result = sanitizePreferences({ theme: 'purple', durations: { focus: 30, short: 999, long: 'x' } });
  assert.deepEqual(result.value, { theme: null, durations: { focus: 30, short: 5, long: 15 } });
  assert.equal(sanitizePreferences({ theme: 'dark' }).value.theme, 'dark');
});

test('sanitizeTimer restores a valid running timer', () => {
  const saved = { mode: 'focus', status: 'running', endAt: 123456, plannedMs: 1500000, remainingMs: 0, subjectId: 'math', sessionId: 'sess-1' };
  const { value } = sanitizeTimer(saved);
  assert.equal(value.status, 'running');
  assert.equal(value.endAt, 123456);
  assert.equal(value.sessionId, 'sess-1');
});

test('sanitizeTimer turns broken timers into an idle one', () => {
  assert.equal(sanitizeTimer(null), null);
  assert.equal(sanitizeTimer({ status: 'running', mode: 'focus', plannedMs: 1000, endAt: 5 }).value.status, 'idle'); // focus run without session id
  assert.equal(sanitizeTimer({ status: 'running', mode: 'short', plannedMs: 'x', endAt: 5 }).value.status, 'idle');
  assert.equal(sanitizeTimer({ status: 'paused', mode: 'short', plannedMs: 1000, remainingMs: -5 }).value.status, 'idle');
  assert.equal(sanitizeTimer({ status: 'wat' }).value.status, 'idle');
});

test('getRouteFromHash maps hashes to pages and falls back to the dashboard', () => {
  assert.equal(getRouteFromHash('#/tasks'), 'tasks');
  assert.equal(getRouteFromHash('#/timer/'), 'timer');
  assert.equal(getRouteFromHash('#/analytics'), 'analytics');
  for (const bad of ['', '#', '#/nope', '#main', '#/tasks?x=1', undefined, null]) {
    assert.equal(getRouteFromHash(bad), 'dashboard');
  }
});
