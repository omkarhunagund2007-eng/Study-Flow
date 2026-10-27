import { SESSIONS_BEFORE_LONG_BREAK } from './constants.js';

// The Pomodoro timer as PURE functions: (old timer, inputs) -> new timer.
//
// How we keep time accurately
// ---------------------------
// A naive timer does `seconds = seconds - 1` every second. Browsers slow down
// background tabs, so that timer drifts and can stop completely. Instead we
// store a TIMESTAMP - the exact moment the timer must finish (`endAt`, in
// milliseconds since 1970) - and work out the time left from the real clock:
//
//      remaining = endAt - Date.now()
//
// An interval only asks "what time is it now?" so the display refreshes. If the
// tab sleeps for 10 minutes, the very next refresh is still correct.
//
// Timer shape:
//   mode        'focus' | 'short' | 'long'
//   status      'idle' | 'running' | 'paused'
//   endAt       timestamp (ms) when it finishes - only while running
//   remainingMs time left - only while paused
//   plannedMs   full length of the current run (used for progress + session length)
//   subjectId   subject chosen for a focus session (or null)
//   sessionId   unique id of the running focus session (prevents duplicate records)

export const IDLE_TIMER = {
  mode: 'focus',
  status: 'idle',
  endAt: null,
  remainingMs: 0,
  plannedMs: 0,
  subjectId: null,
  sessionId: null,
};

export const minutesToMs = (minutes) => minutes * 60 * 1000;

/** Time left right now. When idle it is simply the configured length for the mode. */
export function getRemainingMs(timer, now, durations) {
  if (timer.status === 'running') return Math.max(0, timer.endAt - now);
  if (timer.status === 'paused') return timer.remainingMs;
  return minutesToMs(durations[timer.mode]);
}

/** 0 -> just started, 1 -> finished. Drives the ring around the clock. */
export function getProgress(timer, now) {
  if (timer.status === 'idle' || timer.plannedMs <= 0) return 0;
  const remaining = timer.status === 'running' ? Math.max(0, timer.endAt - now) : timer.remainingMs;
  return Math.min(1, Math.max(0, 1 - remaining / timer.plannedMs));
}

export function startTimer(timer, { now, durationMin, newId }) {
  if (timer.status !== 'idle') return timer;
  const plannedMs = minutesToMs(durationMin);
  const isFocus = timer.mode === 'focus';
  return {
    ...timer,
    status: 'running',
    endAt: now + plannedMs,
    remainingMs: plannedMs,
    plannedMs,
    subjectId: isFocus ? timer.subjectId : null,
    sessionId: isFocus ? newId : null,
  };
}

export function pauseTimer(timer, now) {
  if (timer.status !== 'running') return timer;
  return { ...timer, status: 'paused', remainingMs: Math.max(0, timer.endAt - now), endAt: null };
}

export function resumeTimer(timer, now) {
  if (timer.status !== 'paused') return timer;
  return { ...timer, status: 'running', endAt: now + timer.remainingMs };
}

/** Reset keeps the chosen mode and subject, but throws away the running countdown. */
export function resetTimer(timer) {
  return { ...IDLE_TIMER, mode: timer.mode, subjectId: timer.subjectId };
}

/** Modes can only be switched while idle, so a running session is never lost by accident. */
export function selectMode(timer, mode) {
  return timer.status === 'idle' ? { ...timer, mode } : timer;
}

export function selectSubject(timer, subjectId) {
  return timer.status === 'idle' ? { ...timer, subjectId } : timer;
}

export function isTimerFinished(timer, now) {
  return timer.status === 'running' && now >= timer.endAt;
}

/** After a focus session: long break every 4th session, otherwise a short one. After a break: focus. */
export function nextModeAfter(mode, focusSessionsToday) {
  if (mode !== 'focus') return 'focus';
  return focusSessionsToday > 0 && focusSessionsToday % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'long' : 'short';
}

/**
 * Called once when a running timer reaches its end.
 * Returns the next (idle) timer and, for focus sessions, the session to record.
 * The session id was created when the timer STARTED, so even if this code runs
 * twice, both runs produce the same id and the duplicate is ignored when saving.
 */
export function completeTimer(timer, focusSessionsBefore) {
  const isFocus = timer.mode === 'focus';
  const session = isFocus
    ? {
        id: timer.sessionId,
        subjectId: timer.subjectId,
        durationMin: Math.max(1, Math.round(timer.plannedMs / 60000)),
        // The moment it actually finished (not "now"): correct even if the tab slept.
        completedAt: new Date(timer.endAt).toISOString(),
      }
    : null;

  const nextMode = nextModeAfter(timer.mode, isFocus ? focusSessionsBefore + 1 : 0);
  return {
    session,
    timer: { ...IDLE_TIMER, mode: nextMode, subjectId: timer.subjectId },
  };
}

/** Adds a session only if its id is new. Returns the same array when it is a duplicate. */
export function addSessionOnce(sessions, session) {
  if (!session || sessions.some((existing) => existing.id === session.id)) return sessions;
  return [...sessions, session];
}
