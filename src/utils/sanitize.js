import { isValidDateKey } from './dates.js';
import { normalizeName } from './validation.js';
import {
  DEFAULT_DURATIONS,
  DURATION_LIMITS,
  LIMITS,
  PRIORITY_VALUES,
  SUBJECT_COLOR_VALUES,
} from './constants.js';
import { IDLE_TIMER } from './timer.js';

// Data read from LocalStorage is NOT trusted: it may be old, hand-edited or
// damaged. Each sanitizer rebuilds clean objects from whatever it finds.
// They return { value, dropped } (dropped = how many broken items were removed)
// or null when the whole thing is unusable (for example not an array at all).

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const isIsoDate = (value) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());

function sanitizeList(data, sanitizeItem) {
  if (!Array.isArray(data)) return null;
  const seen = new Set();
  const value = [];
  for (const item of data) {
    const clean = sanitizeItem(item);
    if (clean && !seen.has(clean.id)) {
      seen.add(clean.id);
      value.push(clean);
    }
  }
  return { value, dropped: data.length - value.length };
}

function sanitizeTask(item) {
  if (!isObject(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.title)) return null;
  if (!isValidDateKey(item.deadline)) return null;
  return {
    id: item.id,
    title: item.title.trim().slice(0, LIMITS.titleMax),
    description: typeof item.description === 'string' ? item.description.slice(0, LIMITS.descriptionMax) : '',
    subjectId: isNonEmptyString(item.subjectId) ? item.subjectId : null,
    deadline: item.deadline,
    priority: PRIORITY_VALUES.includes(item.priority) ? item.priority : 'medium',
    completed: item.completed === true,
    createdAt: isIsoDate(item.createdAt) ? item.createdAt : new Date().toISOString(),
    completedAt: item.completed === true && isIsoDate(item.completedAt) ? item.completedAt : null,
  };
}

function sanitizeSubject(item) {
  if (!isObject(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.name)) return null;
  return {
    id: item.id,
    name: normalizeName(item.name).slice(0, LIMITS.subjectNameMax),
    color: SUBJECT_COLOR_VALUES.includes(item.color) ? item.color : SUBJECT_COLOR_VALUES[0],
  };
}

function sanitizeSession(item) {
  if (!isObject(item) || !isNonEmptyString(item.id) || !isIsoDate(item.completedAt)) return null;
  const minutes = Number(item.durationMin);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 24 * 60) return null;
  return {
    id: item.id,
    subjectId: isNonEmptyString(item.subjectId) ? item.subjectId : null,
    durationMin: Math.round(minutes),
    completedAt: item.completedAt,
  };
}

export const sanitizeTasks = (data) => sanitizeList(data, sanitizeTask);
export const sanitizeSubjects = (data) => sanitizeList(data, sanitizeSubject);
export const sanitizeSessions = (data) => sanitizeList(data, sanitizeSession);

function sanitizeDuration(value, key) {
  const { min, max } = DURATION_LIMITS[key];
  return Number.isInteger(value) && value >= min && value <= max ? value : DEFAULT_DURATIONS[key];
}

export function sanitizePreferences(data) {
  if (!isObject(data)) return null;
  const durations = isObject(data.durations) ? data.durations : {};
  return {
    value: {
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : null,
      durations: {
        focus: sanitizeDuration(durations.focus, 'focus'),
        short: sanitizeDuration(durations.short, 'short'),
        long: sanitizeDuration(durations.long, 'long'),
      },
    },
    dropped: 0,
  };
}

export function sanitizeTimer(data) {
  if (!isObject(data)) return null;
  const mode = ['focus', 'short', 'long'].includes(data.mode) ? data.mode : 'focus';
  const subjectId = isNonEmptyString(data.subjectId) ? data.subjectId : null;
  const base = { ...IDLE_TIMER, mode, subjectId };

  const hasPlan = Number.isFinite(data.plannedMs) && data.plannedMs > 0;
  const sessionId = isNonEmptyString(data.sessionId) ? data.sessionId : null;
  // A focus run must have a session id, otherwise it could never be recorded.
  const validRun = hasPlan && (mode !== 'focus' || sessionId !== null);

  if (data.status === 'running' && validRun && Number.isFinite(data.endAt)) {
    return {
      value: { ...base, status: 'running', endAt: data.endAt, plannedMs: data.plannedMs, remainingMs: data.plannedMs, sessionId },
      dropped: 0,
    };
  }
  if (data.status === 'paused' && validRun && Number.isFinite(data.remainingMs) && data.remainingMs > 0) {
    return {
      value: {
        ...base,
        status: 'paused',
        remainingMs: Math.min(data.remainingMs, data.plannedMs),
        plannedMs: data.plannedMs,
        sessionId,
      },
      dropped: 0,
    };
  }
  return { value: base, dropped: 0 };
}
