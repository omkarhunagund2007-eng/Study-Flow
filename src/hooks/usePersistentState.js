import { useEffect, useState } from 'react';
import { loadValue, saveValue } from '../utils/storage.js';

/**
 * Works like useState, but the value is also saved to LocalStorage.
 *
 *   const [tasks, setTasks, info] = usePersistentState('studyflow.tasks', [], sanitizeTasks);
 *
 * - The first render loads (and checks) the saved value. Passing a function to
 *   useState means "run this once, only for the first render".
 * - The effect saves again every time the value changes.
 * - `info.loadStatus` tells the app if saved data was missing/corrupt/repaired.
 * - `info.saveFailed` becomes true when the browser refuses to save.
 */
export function usePersistentState(key, fallback, sanitize) {
  const [loaded] = useState(() => loadValue(key, fallback, sanitize));
  const [value, setValue] = useState(loaded.value);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setSaveFailed(!saveValue(key, value));
  }, [key, value]);

  return [value, setValue, { loadStatus: loaded.status, saveFailed }];
}
