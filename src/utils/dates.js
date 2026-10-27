// Date helpers.
//
// Deadlines are stored as plain "date keys" in the form "YYYY-MM-DD" (local time).
// Why strings and not Date objects?
//   1. They save to LocalStorage as-is (no conversion needed).
//   2. ISO date strings sort correctly as text: "2026-10-09" < "2026-10-27".
//   3. They avoid time-zone surprises: a deadline of "2026-10-27" means the
//      27th wherever you are.

const pad = (number) => String(number).padStart(2, '0');

/** Date -> "YYYY-MM-DD" using the user's LOCAL calendar day. */
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's date key. `now` can be passed in so tests do not depend on the real clock. */
export function todayKey(now = new Date()) {
  return toDateKey(now);
}

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * True only for real calendar dates. "2026-02-30" has the right shape but is
 * not a real day, so we build a Date and check that nothing "rolled over".
 */
export function isValidDateKey(value) {
  if (typeof value !== 'string') return false;
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2000 || year > 2100) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** "YYYY-MM-DD" -> Date at local midnight. Only call with valid keys. */
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Add (or subtract) whole days. setDate handles month ends and daylight saving. */
export function addDays(key, amount) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

/** Whole calendar days from one key to another (positive when `to` is later). */
export function daysBetween(fromKey, toKey) {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  // Date.UTC ignores daylight-saving shifts, so a "day" is always exactly 24h here.
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toUtc - fromUtc) / 86400000);
}

/** The last `count` day keys ending on `endKey`, oldest first. */
export function lastNDays(count, endKey) {
  return Array.from({ length: count }, (_, index) => addDays(endKey, index - (count - 1)));
}

/** "Wed, 28 Oct" (adds the year when it is not the current year). */
export function formatDateShort(key, today) {
  const date = parseDateKey(key);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  if (today && date.getFullYear() !== parseDateKey(today).getFullYear()) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString(undefined, options);
}

/** "Mon" - used under the chart bars. */
export function formatWeekday(key) {
  return parseDateKey(key).toLocaleDateString(undefined, { weekday: 'short' });
}

/** "Tuesday, 27 October" for the dashboard greeting. */
export function formatDateLong(key) {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Human wording for a deadline: "Due today", "Due in 3 days", "Overdue by 2 days". */
export function describeDeadline(key, today) {
  const diff = daysBetween(today, key);
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff > 1) return `Due in ${diff} days`;
  if (diff === -1) return 'Overdue by 1 day';
  return `Overdue by ${Math.abs(diff)} days`;
}
