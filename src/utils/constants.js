// Values that are shared by several files live here, so we change them in one place.

export const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const PRIORITY_VALUES = PRIORITIES.map((priority) => priority.value);

// Used to sort: high priority first.
export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const SUBJECT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#2f80ed' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Red', value: '#e11d48' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Slate', value: '#64748b' },
];

export const SUBJECT_COLOR_VALUES = SUBJECT_COLORS.map((color) => color.value);

// Shown wherever a task or session has no (or a deleted) subject.
export const NO_SUBJECT = { id: null, name: 'No subject', color: '#64748b' };

export const LIMITS = {
  titleMax: 100,
  descriptionMax: 500,
  subjectNameMax: 30,
};

export const TIMER_MODES = [
  { value: 'focus', label: 'Focus' },
  { value: 'short', label: 'Short break' },
  { value: 'long', label: 'Long break' },
];

export const DEFAULT_DURATIONS = { focus: 25, short: 5, long: 15 };

// Allowed range (in minutes) for each configurable duration.
export const DURATION_LIMITS = {
  focus: { min: 1, max: 180 },
  short: { min: 1, max: 60 },
  long: { min: 1, max: 120 },
};

// After this many focus sessions in a day we suggest a long break.
export const SESSIONS_BEFORE_LONG_BREAK = 4;

export const STORAGE_KEYS = {
  tasks: 'studyflow.tasks',
  subjects: 'studyflow.subjects',
  sessions: 'studyflow.sessions',
  preferences: 'studyflow.preferences',
  timer: 'studyflow.timer',
};
