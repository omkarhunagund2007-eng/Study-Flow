import { useEffect, useState } from 'react';
import { todayKey } from '../utils/dates.js';

/**
 * Returns today's date key and updates it by itself when midnight passes,
 * so "due today" and "overdue" stay correct if the page is left open overnight.
 */
export function useToday() {
  const [today, setToday] = useState(() => todayKey());

  useEffect(() => {
    const check = () => setToday(todayKey());
    const id = setInterval(check, 30 * 1000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  return today;
}
