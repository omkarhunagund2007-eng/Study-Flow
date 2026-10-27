import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { usePomodoro } from '../hooks/usePomodoro.js';
import { useToday } from '../hooks/useToday.js';
import { createId } from '../utils/id.js';
import { addSessionOnce } from '../utils/timer.js';
import { sanitizePreferences, sanitizeSessions, sanitizeSubjects, sanitizeTasks } from '../utils/sanitize.js';
import { DEFAULT_DURATIONS, STORAGE_KEYS } from '../utils/constants.js';

// The AppContext holds ALL shared data and every action that changes it.
// Any component can read it with `const { tasks, addTask } = useApp();`
// This avoids "prop drilling" (passing props through many layers).

const AppContext = createContext(null);

const DEFAULT_PREFERENCES = { theme: null, durations: DEFAULT_DURATIONS };

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppProvider({ children }) {
  const today = useToday();

  const [tasks, setTasks, tasksInfo] = usePersistentState(STORAGE_KEYS.tasks, [], sanitizeTasks);
  const [subjects, setSubjects, subjectsInfo] = usePersistentState(STORAGE_KEYS.subjects, [], sanitizeSubjects);
  const [sessions, setSessions, sessionsInfo] = usePersistentState(STORAGE_KEYS.sessions, [], sanitizeSessions);
  const [preferences, setPreferences, preferencesInfo] = usePersistentState(
    STORAGE_KEYS.preferences,
    DEFAULT_PREFERENCES,
    sanitizePreferences,
  );

  // ----- Toast messages (small confirmations) -----
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, tone = 'success') => {
    setToast({ id: createId(), message, tone });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  // ----- Theme -----
  const theme = preferences.theme ?? getSystemTheme();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => {
    setPreferences((current) => ({
      ...current,
      theme: (current.theme ?? getSystemTheme()) === 'dark' ? 'light' : 'dark',
    }));
  }, [setPreferences]);

  const setDurations = useCallback(
    (durations) => setPreferences((current) => ({ ...current, durations })),
    [setPreferences],
  );

  // ----- Tasks -----
  // Rule for state: never change the old array. Build a NEW one (spread, map, filter).
  const addTask = useCallback(
    (values) => {
      const task = { id: createId(), ...values, completed: false, createdAt: new Date().toISOString(), completedAt: null };
      setTasks((current) => [...current, task]);
    },
    [setTasks],
  );
  const updateTask = useCallback(
    (id, values) => setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...values } : task))),
    [setTasks],
  );
  const toggleTask = useCallback(
    (id) =>
      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? { ...task, completed: !task.completed, completedAt: task.completed ? null : new Date().toISOString() }
            : task,
        ),
      ),
    [setTasks],
  );
  const deleteTask = useCallback((id) => setTasks((current) => current.filter((task) => task.id !== id)), [setTasks]);

  // ----- Subjects -----
  const addSubject = useCallback(
    (values) => setSubjects((current) => [...current, { id: createId(), ...values }]),
    [setSubjects],
  );
  const updateSubject = useCallback(
    (id, values) => setSubjects((current) => current.map((subject) => (subject.id === id ? { ...subject, ...values } : subject))),
    [setSubjects],
  );
  // Deleting a subject NEVER deletes tasks or study history: they are kept and
  // simply become "No subject". The UI asks for confirmation before calling this.
  const deleteSubject = useCallback(
    (id) => {
      setSubjects((current) => current.filter((subject) => subject.id !== id));
      setTasks((current) => current.map((task) => (task.subjectId === id ? { ...task, subjectId: null } : task)));
      setSessions((current) => current.map((session) => (session.subjectId === id ? { ...session, subjectId: null } : session)));
    },
    [setSubjects, setTasks, setSessions],
  );

  // ----- Study sessions -----
  const recordSession = useCallback((session) => setSessions((current) => addSessionOnce(current, session)), [setSessions]);
  const clearSessions = useCallback(() => setSessions([]), [setSessions]);

  // ----- Timer -----
  const subjectName = useCallback(
    (id) => subjects.find((subject) => subject.id === id)?.name ?? 'No subject',
    [subjects],
  );
  const onFocusComplete = useCallback(
    (session) => notify(`Focus session complete. ${session.durationMin} min saved for ${subjectName(session.subjectId)}.`),
    [notify, subjectName],
  );
  const onBreakComplete = useCallback(() => notify('Break over. Ready for your next focus session?'), [notify]);

  const pomodoro = usePomodoro({
    durations: preferences.durations,
    sessions,
    recordSession,
    onFocusComplete,
    onBreakComplete,
  });

  // If a subject is deleted while it is selected on the timer, fall back to "No subject".
  const { timer, setSubject } = pomodoro;
  useEffect(() => {
    if (timer.subjectId && timer.status === 'idle' && !subjects.some((subject) => subject.id === timer.subjectId)) {
      setSubject(null);
    }
  }, [timer.subjectId, timer.status, subjects, setSubject]);

  // ----- Notices about LocalStorage -----
  const infos = [tasksInfo, subjectsInfo, sessionsInfo, preferencesInfo, pomodoro.timerInfo];
  const dataWasDamaged = infos.some((info) => info.loadStatus === 'corrupt' || info.loadStatus === 'repaired');
  const storageUnavailable = infos.some((info) => info.saveFailed);
  const [damageNoticeDismissed, setDamageNoticeDismissed] = useState(false);

  const value = useMemo(
    () => ({
      today,
      tasks,
      subjects,
      sessions,
      durations: preferences.durations,
      theme,
      toggleTheme,
      setDurations,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      addSubject,
      updateSubject,
      deleteSubject,
      clearSessions,
      pomodoro,
      toast,
      notify,
      dismissToast,
      dataWasDamaged: dataWasDamaged && !damageNoticeDismissed,
      dismissDamageNotice: () => setDamageNoticeDismissed(true),
      storageUnavailable,
    }),
    [
      today, tasks, subjects, sessions, preferences.durations, theme, toggleTheme, setDurations,
      addTask, updateTask, toggleTask, deleteTask, addSubject, updateSubject, deleteSubject,
      clearSessions, pomodoro, toast, notify, dismissToast, dataWasDamaged, damageNoticeDismissed, storageUnavailable,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside <AppProvider>.');
  return context;
}
