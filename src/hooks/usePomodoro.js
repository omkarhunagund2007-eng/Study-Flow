import { useCallback, useEffect, useRef, useState } from 'react';
import { createId } from '../utils/id.js';
import { sanitizeTimer } from '../utils/sanitize.js';
import { IDLE_TIMER, completeTimer, getProgress, getRemainingMs, isTimerFinished, pauseTimer, resetTimer, resumeTimer, selectMode, selectSubject, startTimer } from '../utils/timer.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { sessionsOnDate } from '../utils/study.js';
import { todayKey } from '../utils/dates.js';
import { usePersistentState } from './usePersistentState.js';

/**
 * Connects the pure timer functions (utils/timer.js) to React.
 * It lives at the top of the app (inside AppContext), NOT inside the timer page,
 * so the countdown keeps running while you visit other pages.
 */
export function usePomodoro({ durations, sessions, recordSession, onFocusComplete, onBreakComplete }) {
  const [timer, setTimer, info] = usePersistentState(STORAGE_KEYS.timer, IDLE_TIMER, sanitizeTimer);
  const [now, setNow] = useState(() => Date.now());
  const handledRef = useRef(null);

  // While running, refresh `now` four times a second. The time left is always
  // calculated from the real clock, so these refreshes only update the screen.
  const running = timer.status === 'running';
  useEffect(() => {
    if (!running) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  // When the end time is reached: record the session (once) and move on.
  useEffect(() => {
    if (!isTimerFinished(timer, now)) return;
    const key = `${timer.mode}:${timer.endAt}`;
    if (handledRef.current === key) return; // already handled (StrictMode runs effects twice in development)
    handledRef.current = key;

    const todayCount = sessionsOnDate(sessions, todayKey(new Date(timer.endAt))).length;
    const { session, timer: nextTimer } = completeTimer(timer, todayCount);
    setTimer(nextTimer);
    if (session) {
      recordSession(session);
      onFocusComplete(session);
    } else {
      onBreakComplete(timer.mode);
    }
  }, [timer, now, sessions, setTimer, recordSession, onFocusComplete, onBreakComplete]);

  const start = useCallback(() => {
    setTimer((current) => startTimer(current, { now: Date.now(), durationMin: durations[current.mode], newId: createId() }));
  }, [durations, setTimer]);
  const pause = useCallback(() => setTimer((current) => pauseTimer(current, Date.now())), [setTimer]);
  const resume = useCallback(() => setTimer((current) => resumeTimer(current, Date.now())), [setTimer]);
  const reset = useCallback(() => setTimer((current) => resetTimer(current)), [setTimer]);
  const setMode = useCallback((mode) => setTimer((current) => selectMode(current, mode)), [setTimer]);
  const setSubject = useCallback((subjectId) => setTimer((current) => selectSubject(current, subjectId)), [setTimer]);

  return {
    timer,
    timerInfo: info,
    remainingMs: getRemainingMs(timer, now, durations),
    progress: getProgress(timer, now),
    start,
    pause,
    resume,
    reset,
    setMode,
    setSubject,
  };
}
