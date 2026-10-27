import { isValidDateKey } from './dates.js';
import {
  DURATION_LIMITS,
  LIMITS,
  PRIORITY_VALUES,
  SUBJECT_COLOR_VALUES,
} from './constants.js';

// Every validate* function returns { errors, values }:
//   errors - an object like { title: "Title is required." } (empty when everything is fine)
//   values - the cleaned-up data (trimmed text, empty subject -> null, ...)
// The form shows `errors`; when `errors` is empty it saves `values`.

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** Trim and collapse repeated spaces: "  Linear   Algebra " -> "Linear Algebra". */
export function normalizeName(value) {
  return cleanText(value).replace(/\s+/g, ' ');
}

export function validateTask(input, { subjects = [] } = {}) {
  const errors = {};
  const title = cleanText(input.title);
  const description = cleanText(input.description);
  const subjectId = input.subjectId ? String(input.subjectId) : null;
  const deadline = typeof input.deadline === 'string' ? input.deadline : '';
  const priority = input.priority;

  if (!title) errors.title = 'Enter a title for the task.';
  else if (title.length > LIMITS.titleMax) {
    errors.title = `Keep the title under ${LIMITS.titleMax} characters (now ${title.length}).`;
  }

  if (description.length > LIMITS.descriptionMax) {
    errors.description = `Keep the description under ${LIMITS.descriptionMax} characters (now ${description.length}).`;
  }

  if (!deadline) errors.deadline = 'Choose a deadline.';
  else if (!isValidDateKey(deadline)) {
    errors.deadline = 'Enter a real date between 2000 and 2100.';
  }

  if (!PRIORITY_VALUES.includes(priority)) errors.priority = 'Choose High, Medium or Low.';

  if (subjectId && !subjects.some((subject) => subject.id === subjectId)) {
    errors.subjectId = 'That subject no longer exists. Pick another one.';
  }

  return { errors, values: { title, description, subjectId, deadline, priority } };
}

/**
 * `editingId` is the subject being edited (if any), so a subject is allowed to
 * keep its own name without being reported as a duplicate of itself.
 */
export function validateSubject(input, { subjects = [], editingId = null } = {}) {
  const errors = {};
  const name = normalizeName(input.name);
  const color = input.color;

  if (!name) errors.name = 'Enter a subject name.';
  else if (name.length > LIMITS.subjectNameMax) {
    errors.name = `Keep the name under ${LIMITS.subjectNameMax} characters (now ${name.length}).`;
  } else {
    const duplicate = subjects.some(
      (subject) => subject.id !== editingId && subject.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) errors.name = `You already have a subject called "${name}".`;
  }

  if (!SUBJECT_COLOR_VALUES.includes(color)) errors.color = 'Choose one of the colors.';

  return { errors, values: { name, color } };
}

const DURATION_LABELS = { focus: 'Focus', short: 'Short break', long: 'Long break' };

/** Inputs give us text, so each value is converted to a number and range-checked. */
export function validateDurations(input) {
  const errors = {};
  const values = {};

  for (const key of Object.keys(DURATION_LIMITS)) {
    const { min, max } = DURATION_LIMITS[key];
    const raw = typeof input[key] === 'string' ? input[key].trim() : input[key];
    const number = raw === '' || raw === null || raw === undefined ? NaN : Number(raw);

    if (!Number.isInteger(number)) {
      errors[key] = `${DURATION_LABELS[key]} must be a whole number of minutes.`;
    } else if (number < min || number > max) {
      errors[key] = `${DURATION_LABELS[key]} must be between ${min} and ${max} minutes.`;
    } else {
      values[key] = number;
    }
  }

  return { errors, values };
}
