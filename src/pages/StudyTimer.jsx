import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { TIMER_MODES } from '../utils/constants.js';
import { formatMinutes, pluralize } from '../utils/format.js';
import { minutesOnDate, sessionsOnDate, sortSessionsNewestFirst } from '../utils/study.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DurationForm from '../components/DurationForm.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SessionHistory from '../components/SessionHistory.jsx';
import TimerDial from '../components/TimerDial.jsx';

const HISTORY_PREVIEW = 8;
const STATUS_LABELS = { idle: 'Ready', running: 'Running', paused: 'Paused' };

export default function StudyTimer() {
  const { today, subjects, sessions, durations, setDurations, clearSessions, pomodoro, notify } = useApp();
  const { timer, remainingMs, progress, start, pause, resume, reset, setMode, setSubject } = pomodoro;
  const [showAll, setShowAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const isIdle = timer.status === 'idle';
  const modeLabel = TIMER_MODES.find((mode) => mode.value === timer.mode).label;
  const todaySessions = sessionsOnDate(sessions, today);
  const sorted = sortSessionsNewestFirst(sessions);
  const visible = showAll ? sorted : sorted.slice(0, HISTORY_PREVIEW);

  return (
    <>
      <PageHeader title="Study Timer" description="Work in focused blocks, then take a break." />

      <div className="timer-grid">
        <section className="card timer-card" aria-label="Timer">
          <div className="segmented" role="group" aria-label="Timer mode">
            {TIMER_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                className="segmented__button"
                aria-pressed={timer.mode === mode.value}
                disabled={!isIdle}
                onClick={() => setMode(mode.value)}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <TimerDial remainingMs={remainingMs} progress={progress} modeLabel={modeLabel} statusLabel={STATUS_LABELS[timer.status]} />

          {timer.mode === 'focus' && (
            <div className="field timer-card__subject">
              <label htmlFor="timer-subject">Studying</label>
              <select id="timer-subject" value={timer.subjectId ?? ''} disabled={!isIdle} onChange={(event) => setSubject(event.target.value || null)}>
                <option value="">No subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="timer-card__controls">
            {timer.status === 'idle' && (
              <button type="button" className="btn btn--primary btn--lg" onClick={start}>
                <Icon name="play" size={18} />
                <span>Start</span>
              </button>
            )}
            {timer.status === 'running' && (
              <button type="button" className="btn btn--primary btn--lg" onClick={pause}>
                <Icon name="pause" size={18} />
                <span>Pause</span>
              </button>
            )}
            {timer.status === 'paused' && (
              <button type="button" className="btn btn--primary btn--lg" onClick={resume}>
                <Icon name="play" size={18} />
                <span>Resume</span>
              </button>
            )}
            {!isIdle && (
              <button type="button" className="btn btn--ghost btn--lg" onClick={reset}>
                <Icon name="reset" size={18} />
                <span>Reset</span>
              </button>
            )}
          </div>
          {!isIdle && timer.mode === 'focus' && (
            <p className="muted timer-card__note">Reset cancels this session. Unfinished sessions are not recorded.</p>
          )}
        </section>

        <div className="timer-side">
          <section className="card" aria-labelledby="today-title">
            <h2 id="today-title">Today</h2>
            <p className="big-number">{formatMinutes(minutesOnDate(sessions, today))}</p>
            <p className="muted">{pluralize(todaySessions.length, 'focus session')} completed</p>
          </section>

          <section className="card" aria-labelledby="durations-title">
            <h2 id="durations-title">Timer lengths</h2>
            <DurationForm
              key={`${durations.focus}-${durations.short}-${durations.long}`}
              durations={durations}
              onSave={(values, message) => {
                setDurations(values);
                notify(message ?? 'Timer lengths saved.');
              }}
            />
          </section>
        </div>
      </div>

      <section className="card" aria-labelledby="history-title">
        <div className="card__header">
          <h2 id="history-title">Session history</h2>
          {sessions.length > 0 && (
            <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setConfirmClear(true)}>
              <Icon name="trash" size={16} />
              <span>Clear history</span>
            </button>
          )}
        </div>
        {sessions.length === 0 ? (
          <EmptyState icon="timer" title="No sessions yet" message="Finish a focus session and it will be recorded here." />
        ) : (
          <>
            <SessionHistory sessions={visible} />
            {sorted.length > HISTORY_PREVIEW && (
              <button type="button" className="btn btn--ghost btn--block" onClick={() => setShowAll((value) => !value)}>
                {showAll ? 'Show fewer' : `Show all ${sorted.length} sessions`}
              </button>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={confirmClear}
        title="Clear session history?"
        message="All recorded focus sessions will be removed. Your analytics and study totals will reset to zero. This cannot be undone."
        confirmLabel="Clear history"
        onConfirm={() => {
          clearSessions();
          setConfirmClear(false);
          setShowAll(false);
          notify('Session history cleared.');
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
