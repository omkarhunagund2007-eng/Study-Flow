// A small, safe wrapper around LocalStorage.
//
// LocalStorage can fail in surprising ways: the data may be missing, may have
// been edited by hand into invalid JSON, or the browser may block storage
// completely (private mode, full disk). Every call below is wrapped in
// try/catch so the app keeps working instead of crashing.

function backup(key, raw) {
  // Keep a copy of data we could not understand, so nothing is lost for good.
  try {
    globalThis.localStorage.setItem(`${key}.backup`, raw);
  } catch {
    /* nothing more we can do */
  }
}

/**
 * Reads and checks one value. Returns { value, status } where status is:
 *   'missing'     - nothing saved yet (first visit)
 *   'ok'          - loaded fine
 *   'repaired'    - loaded, but some broken items were dropped
 *   'corrupt'     - could not be understood, the fallback is used
 *   'unavailable' - the browser blocks storage
 *
 * `sanitize(parsed)` must return { value, dropped } or null when the data is unusable.
 */
export function loadValue(key, fallback, sanitize) {
  let raw;
  try {
    raw = globalThis.localStorage.getItem(key);
  } catch {
    return { value: fallback, status: 'unavailable' };
  }

  if (raw === null || raw === undefined) return { value: fallback, status: 'missing' };

  try {
    const parsed = JSON.parse(raw);
    const result = sanitize ? sanitize(parsed) : { value: parsed, dropped: 0 };
    if (result === null || result === undefined) throw new Error('Unexpected data shape');
    if (result.dropped > 0) {
      backup(key, raw);
      return { value: result.value, status: 'repaired' };
    }
    return { value: result.value, status: 'ok' };
  } catch {
    backup(key, raw);
    return { value: fallback, status: 'corrupt' };
  }
}

/** Returns true when saved, false when the browser refused. */
export function saveValue(key, value) {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
