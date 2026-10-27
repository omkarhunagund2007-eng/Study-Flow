import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatDateLong } from '../utils/dates.js';
import { formatMinutes, pluralize } from '../utils/format.js';
import { computeTaskStats, getDeadlineList } from '../utils/tasks.js';
import { minutesOnDate } from '../utils/study.js';
import DeadlineList from '../components/DeadlineList.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StatCard from '../components/StatCard.jsx';

export default function Dashboard() {
  const { tasks, sessions, today } = useApp();

  // useMemo remembers the result and only recalculates when its inputs change.
  const stats = useMemo(() => computeTaskStats(tasks, today), [tasks, today]);
  const studyToday = useMemo(() => minutesOnDate(sessions, today), [sessions, today]);
  const deadlines = useMemo(() => getDeadlineList(tasks, today, 6), [tasks, today]);

  return (
    <>
      <PageHeader title="Dashboard" description={`Today is ${formatDateLong(today)}. Here is where you stand.`} />

      {stats.overdue > 0 && (
        <div className="notice notice--danger">
          <Icon name="alert" />
          <p>
            You have <strong>{pluralize(stats.overdue, 'overdue task')}</strong>.
          </p>
          <a className="btn btn--ghost btn--sm" href="#/tasks">Review tasks</a>
        </div>
      )}

      <section aria-label="Summary">
        <dl className="stat-grid">
          <StatCard label="Total tasks" value={stats.total} icon="list" />
          <StatCard label="Completed" value={stats.completed} icon="circleCheck" tone="success" />
          <StatCard label="Pending" value={stats.pending} icon="tasks" />
          <StatCard label="Due today" value={stats.dueToday} icon="calendar" tone={stats.dueToday > 0 ? 'warning' : 'neutral'} />
          <StatCard label="Studied today" value={formatMinutes(studyToday)} icon="timer" />
          <StatCard label="Completion" value={`${stats.completionPercent}%`} icon="trend" tone="primary" />
        </dl>
      </section>

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="deadlines-title">
          <div className="card__header">
            <h2 id="deadlines-title">Upcoming deadlines</h2>
            {tasks.length > 0 && <a className="link" href="#/tasks">View all tasks</a>}
          </div>
          {tasks.length === 0 ? (
            <EmptyState
              icon="tasks"
              title="No tasks yet"
              message="Add your first task and its deadline will show up here."
              action={<a className="btn btn--primary" href="#/tasks">Go to Tasks</a>}
            />
          ) : deadlines.length === 0 ? (
            <EmptyState icon="circleCheck" title="You are all caught up" message="No pending tasks. Enjoy the free time or add something new." />
          ) : (
            <DeadlineList tasks={deadlines} today={today} />
          )}
        </section>

        <section className="card" aria-labelledby="progress-title">
          <h2 id="progress-title">Task progress</h2>
          {stats.total === 0 ? (
            <p className="muted">Progress appears once you add tasks.</p>
          ) : (
            <>
              <p className="progress-text">
                <strong>{stats.completed}</strong> of {pluralize(stats.total, 'task')} completed
              </p>
              <ProgressBar value={stats.completionPercent} label="Task completion" />
            </>
          )}
          <div className="card__links">
            <a className="btn btn--primary" href="#/timer">
              <Icon name="play" size={16} />
              <span>Start a focus session</span>
            </a>
            <a className="btn btn--ghost" href="#/analytics">See analytics</a>
          </div>
        </section>
      </div>
    </>
  );
}
