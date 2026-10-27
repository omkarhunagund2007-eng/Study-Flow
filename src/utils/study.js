import { addDays, lastNDays, toDateKey } from './dates.js';
import { NO_SUBJECT } from './constants.js';

// Pure functions that turn the list of recorded focus sessions into statistics.
// A session looks like: { id, subjectId, durationMin, completedAt (ISO text) }.

/** The LOCAL calendar day a session was completed on. */
export function sessionDateKey(session) {
  return toDateKey(new Date(session.completedAt));
}

export function sumMinutes(sessions) {
  return sessions.reduce((total, session) => total + session.durationMin, 0);
}

export function sessionsOnDate(sessions, dateKey) {
  return sessions.filter((session) => sessionDateKey(session) === dateKey);
}

/** Study minutes recorded on one day. */
export function minutesOnDate(sessions, dateKey) {
  return sumMinutes(sessionsOnDate(sessions, dateKey));
}

/**
 * One entry per day for the last `days` days (oldest first), including days
 * with no study at all - the chart needs those as zero bars.
 */
export function dailyTotals(sessions, days, today) {
  return lastNDays(days, today).map((date) => {
    const daySessions = sessionsOnDate(sessions, date);
    return { date, minutes: sumMinutes(daySessions), sessionCount: daySessions.length };
  });
}

/** "Weekly" study time = the last 7 days including today (the same days the chart shows). */
export function weeklyMinutes(sessions, today) {
  return dailyTotals(sessions, 7, today).reduce((total, day) => total + day.minutes, 0);
}

export function weeklySessionCount(sessions, today) {
  const start = addDays(today, -6);
  return sessions.filter((session) => {
    const key = sessionDateKey(session);
    return key >= start && key <= today;
  }).length;
}

/**
 * Study minutes per subject, biggest first. Sessions whose subject was deleted
 * (or never chosen) are grouped under "No subject".
 */
export function minutesBySubject(sessions, subjects) {
  const buckets = new Map();

  for (const session of sessions) {
    const subject = subjects.find((item) => item.id === session.subjectId) ?? NO_SUBJECT;
    const existing = buckets.get(subject.id) ?? {
      subjectId: subject.id,
      name: subject.name,
      color: subject.color,
      minutes: 0,
      sessionCount: 0,
    };
    existing.minutes += session.durationMin;
    existing.sessionCount += 1;
    buckets.set(subject.id, existing);
  }

  return [...buckets.values()].sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name));
}

/** Newest first. Copies the array so state is never sorted in place. */
export function sortSessionsNewestFirst(sessions) {
  return [...sessions].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}
