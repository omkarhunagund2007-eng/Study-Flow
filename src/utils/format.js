/** 85 -> "1h 25m", 45 -> "45m", 0 -> "0m". Input is minutes. */
export function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/** 1500000 ms -> "25:00". Rounds UP so the display never shows 00:00 before the end. */
export function formatClock(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** ISO timestamp -> "27 Oct, 10:42 am" in the user's locale. */
export function formatDateTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Simple plural helper: pluralize(1, "task") -> "1 task", pluralize(2, "task") -> "2 tasks". */
export function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/** 25 -> "25 min" (used for single sessions, where "25m" would look cramped). */
export function formatMinutesLabel(minutes) {
  return `${minutes} min`;
}
