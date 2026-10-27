import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatDateShort, formatWeekday } from '../utils/dates.js';
import { formatMinutes } from '../utils/format.js';
import { computeTaskStats } from '../utils/tasks.js';
import { dailyTotals, minutesBySubject, minutesOnDate, sumMinutes, weeklyMinutes, weeklySessionCount, sessionsOnDate } from '../utils/study.js';
import BarChart from '../components/BarChart.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StatCard from '../components/StatCard.jsx';
import SubjectBars from '../components/SubjectBars.jsx';
import TaskSplit from '../components/TaskSplit.jsx';

export default function Analytics() {
  const { tasks, sessions, subjects, today } = useApp();

  // Everything below is calculated from the saved tasks and sessions.
  const stats = useMemo(() => computeTaskStats(tasks, today), [tasks, today]);
  const daily = useMemo(() => dailyTotals(sessions, 7, today), [sessions, today]);
  const subjectRows = useMemo(() => minutesBySubject(sessions, subjects), [sessions, subjects]);
  const weekMinutes = weeklyMinutes(sessions, today);

  const chartData = daily.map((day) => ({
    key: day.date,
    label: day.date === today ? 'Today' : formatWeekday(day.date),
    value: day.minutes,
    description: formatDateShort(day.date, today),
    highlight: day.date === today,
  }));

  return (
    <>
      <PageHeader title="Analytics" description="See how your work and study time add up." />

      <section aria-label="Study summary">
        <dl className="stat-grid">
          <StatCard label="Studied today" value={formatMinutes(minutesOnDate(sessions, today))} icon="timer" />
          <StatCard label="Last 7 days" value={formatMinutes(weekMinutes)} icon="calendar" hint="Including today" />
          <StatCard label="Focus sessions, total" value={sessions.length} icon="circleCheck" tone="success" />
          <StatCard label="Focus sessions, today" value={sessionsOnDate(sessions, today).length} icon="play" />
          <StatCard label="Focus sessions, 7 days" value={weeklySessionCount(sessions, today)} icon="trend" />
          <StatCard label="All-time study" value={formatMinutes(sumMinutes(sessions))} icon="analytics" tone="primary" />
        </dl>
      </section>

      <div className="analytics-grid">
        <section className="card" aria-labelledby="activity-title">
          <h2 id="activity-title">Study activity, last 7 days</h2>
          {weekMinutes === 0 ? (
            <EmptyState
              icon="analytics"
              title="No study time this week"
              message="Complete a focus session and your daily bars will appear here."
              action={<a className="btn btn--primary" href="#/timer">Start a focus session</a>}
            />
          ) : (
            <BarChart data={chartData} title="Minutes studied in the last 7 days" />
          )}
        </section>

        <section className="card" aria-labelledby="tasks-title">
          <h2 id="tasks-title">Completed vs pending tasks</h2>
          {stats.total === 0 ? (
            <EmptyState icon="tasks" title="No tasks yet" message="Add tasks to see how many you have finished." action={<a className="btn btn--primary" href="#/tasks">Go to Tasks</a>} />
          ) : (
            <>
              <TaskSplit stats={stats} />
              <p className="progress-text">
                <strong>{stats.completionPercent}%</strong> complete
              </p>
              <ProgressBar value={stats.completionPercent} label="Task completion" />
            </>
          )}
        </section>

        <section className="card analytics-grid__wide" aria-labelledby="subjects-title">
          <h2 id="subjects-title">Study time by subject (all time)</h2>
          {subjectRows.length === 0 ? (
            <EmptyState icon="subjects" title="No study time recorded" message="Choose a subject on the timer page, then finish a focus session." />
          ) : (
            <SubjectBars rows={subjectRows} />
          )}
        </section>
      </div>
    </>
  );
}
