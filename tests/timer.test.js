import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addSessionOnce,
  completeTimer,
  getProgress,
  getRemainingMs,
  IDLE_TIMER,
  isTimerFinished,
  nextModeAfter,
  pauseTimer,
  resetTimer,
  resumeTimer,
  selectMode,
  selectSubject,
  startTimer,
} from '../src/utils/timer.js';

const durations = { focus: 25, short: 5, long: 15 };
const MIN = 60 * 1000;
const T0 = Date.UTC(2026, 9, 27, 4, 30, 0);

test('an idle timer shows the configured length for its mode', () => {
  assert.equal(getRemainingMs(IDLE_TIMER, T0, durations), 25 * MIN);
  assert.equal(getRemainingMs({ ...IDLE_TIMER, mode: 'short' }, T0, durations), 5 * MIN);
  assert.equal(getRemainingMs({ ...IDLE_TIMER, mode: 'long' }, T0, { ...durations, long: 20 }), 20 * MIN);
});

test('starting stores an end TIMESTAMP, not a counter', () => {
  const running = startTimer({ ...IDLE_TIMER, subjectId: 'math' }, { now: T0, durationMin: 25, newId: 'sess-1' });
  assert.equal(running.status, 'running');
  assert.equal(running.endAt, T0 + 25 * MIN);
  assert.equal(running.sessionId, 'sess-1');
  assert.equal(running.subjectId, 'math');
  assert.equal(getRemainingMs(running, T0 + 10 * MIN, durations), 15 * MIN);
});

test('remaining time follows the real clock even after a long gap (sleeping tab)', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 's' });
  // No "ticks" happened for 20 minutes - the answer is still exact.
  assert.equal(getRemainingMs(running, T0 + 20 * MIN, durations), 5 * MIN);
  assert.equal(getRemainingMs(running, T0 + 90 * MIN, durations), 0); // never negative
});

test('pause freezes the remaining time and resume continues from it', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 's' });
  const paused = pauseTimer(running, T0 + 10 * MIN);
  assert.equal(paused.status, 'paused');
  assert.equal(paused.remainingMs, 15 * MIN);
  assert.equal(getRemainingMs(paused, T0 + 500 * MIN, durations), 15 * MIN); // time passing does not matter
  const resumed = resumeTimer(paused, T0 + 30 * MIN);
  assert.equal(resumed.status, 'running');
  assert.equal(resumed.endAt, T0 + 45 * MIN);
});

test('pause only works while running, resume only while paused', () => {
  assert.equal(pauseTimer(IDLE_TIMER, T0), IDLE_TIMER);
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 's' });
  assert.equal(resumeTimer(running, T0), running);
});

test('start is ignored when the timer is already running', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 'first' });
  assert.equal(startTimer(running, { now: T0 + MIN, durationMin: 25, newId: 'second' }), running);
});

test('reset returns to idle but keeps mode and subject', () => {
  const running = startTimer({ ...IDLE_TIMER, subjectId: 'math' }, { now: T0, durationMin: 25, newId: 's' });
  const reset = resetTimer(running);
  assert.equal(reset.status, 'idle');
  assert.equal(reset.endAt, null);
  assert.equal(reset.sessionId, null);
  assert.equal(reset.subjectId, 'math');
  assert.equal(reset.mode, 'focus');
});

test('mode and subject can only change while idle', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 's' });
  assert.equal(selectMode(running, 'long'), running);
  assert.equal(selectSubject(running, 'x'), running);
  assert.equal(selectMode(IDLE_TIMER, 'long').mode, 'long');
  assert.equal(selectSubject(IDLE_TIMER, 'x').subjectId, 'x');
});

test('break timers do not carry a subject or a session id', () => {
  const running = startTimer({ ...IDLE_TIMER, mode: 'short', subjectId: 'math' }, { now: T0, durationMin: 5, newId: 'ignored' });
  assert.equal(running.sessionId, null);
  assert.equal(running.subjectId, null);
});

test('isTimerFinished is true exactly at and after the end time', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 's' });
  assert.equal(isTimerFinished(running, T0 + 25 * MIN - 1), false);
  assert.equal(isTimerFinished(running, T0 + 25 * MIN), true);
  assert.equal(isTimerFinished(running, T0 + 99 * MIN), true);
  assert.equal(isTimerFinished(pauseTimer(running, T0 + MIN), T0 + 99 * MIN), false);
});

test('progress goes from 0 to 1', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 20, newId: 's' });
  assert.equal(getProgress(IDLE_TIMER, T0), 0);
  assert.equal(getProgress(running, T0), 0);
  assert.equal(getProgress(running, T0 + 5 * MIN), 0.25);
  assert.equal(getProgress(running, T0 + 40 * MIN), 1);
});

test('finishing a focus session produces one record stamped with the END time', () => {
  const running = startTimer({ ...IDLE_TIMER, subjectId: 'math' }, { now: T0, durationMin: 25, newId: 'sess-1' });
  const { session, timer } = completeTimer(running, 0);
  assert.deepEqual(session, {
    id: 'sess-1',
    subjectId: 'math',
    durationMin: 25,
    completedAt: new Date(T0 + 25 * MIN).toISOString(),
  });
  assert.equal(timer.status, 'idle');
  assert.equal(timer.mode, 'short');
  assert.equal(timer.subjectId, 'math');
});

test('the session length is the length that was planned when it started', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 50, newId: 's' });
  assert.equal(completeTimer(running, 0).session.durationMin, 50);
});

test('finishing a break records nothing and goes back to focus', () => {
  const running = startTimer({ ...IDLE_TIMER, mode: 'short' }, { now: T0, durationMin: 5, newId: 'x' });
  const { session, timer } = completeTimer(running, 3);
  assert.equal(session, null);
  assert.equal(timer.mode, 'focus');
});

test('every 4th focus session of the day suggests a long break', () => {
  assert.equal(nextModeAfter('focus', 1), 'short');
  assert.equal(nextModeAfter('focus', 3), 'short');
  assert.equal(nextModeAfter('focus', 4), 'long');
  assert.equal(nextModeAfter('focus', 8), 'long');
  assert.equal(nextModeAfter('long', 4), 'focus');
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 's' });
  assert.equal(completeTimer(running, 3).timer.mode, 'long'); // this is the 4th
  assert.equal(completeTimer(running, 2).timer.mode, 'short');
});

test('completing the same run twice cannot create duplicate records', () => {
  const running = startTimer(IDLE_TIMER, { now: T0, durationMin: 25, newId: 'sess-1' });
  const first = completeTimer(running, 0).session;
  const second = completeTimer(running, 0).session; // e.g. React StrictMode running an effect twice
  let saved = [];
  saved = addSessionOnce(saved, first);
  saved = addSessionOnce(saved, second);
  assert.equal(saved.length, 1);
});

test('addSessionOnce returns a NEW array for a new session and the SAME array for a duplicate', () => {
  const original = [{ id: 'a', subjectId: null, durationMin: 25, completedAt: new Date(T0).toISOString() }];
  const added = addSessionOnce(original, { ...original[0], id: 'b' });
  assert.notEqual(added, original);
  assert.equal(original.length, 1); // never mutated
  assert.equal(added.length, 2);
  assert.equal(addSessionOnce(original, original[0]), original);
  assert.equal(addSessionOnce(original, null), original);
});
