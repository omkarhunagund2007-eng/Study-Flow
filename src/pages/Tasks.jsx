import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { DEFAULT_FILTERS, filterAndSortTasks, hasActiveFilters } from '../utils/tasks.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskList from '../components/TaskList.jsx';

export default function Tasks() {
  const { tasks, subjects, today, addTask, updateTask, toggleTask, deleteTask, notify } = useApp();
  const [rawFilters, setFilters] = useState(DEFAULT_FILTERS);
  const [form, setForm] = useState({ open: false, task: null }); // task = null means "adding"
  const [taskToDelete, setTaskToDelete] = useState(null);

  // If the subject being filtered on was deleted, quietly treat it as "all subjects".
  const subjectStillExists =
    rawFilters.subject === 'all' || rawFilters.subject === 'none' || subjects.some((subject) => subject.id === rawFilters.subject);
  const filters = subjectStillExists ? rawFilters : { ...rawFilters, subject: 'all' };

  const visibleTasks = useMemo(() => filterAndSortTasks(tasks, filters, today), [tasks, filters, today]);

  const updateFilters = (patch) => setFilters({ ...filters, ...patch });
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  function handleSubmit(values) {
    if (form.task) {
      updateTask(form.task.id, values);
      notify('Task updated.');
    } else {
      addTask(values);
      notify('Task added.');
    }
    setForm({ open: false, task: null });
  }

  function handleDelete() {
    deleteTask(taskToDelete.id);
    notify(`Deleted "${taskToDelete.title}".`);
    setTaskToDelete(null);
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Everything you need to do, in one place."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setForm({ open: true, task: null })}>
            <Icon name="plus" size={18} />
            <span>Add task</span>
          </button>
        }
      />

      {tasks.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="tasks"
            title="No tasks yet"
            message="Add a task with a deadline and priority to start planning your work."
            action={
              <button type="button" className="btn btn--primary" onClick={() => setForm({ open: true, task: null })}>
                Add your first task
              </button>
            }
          />
        </div>
      ) : (
        <>
          <TaskFilters filters={filters} subjects={subjects} onChange={updateFilters} onClear={clearFilters} canClear={hasActiveFilters(filters)} />
          <p className="results-count muted" aria-live="polite">
            Showing {visibleTasks.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
          {visibleTasks.length === 0 ? (
            <div className="card">
              <EmptyState
                icon="search"
                title="No tasks match your filters"
                message="Try a different search or clear the filters to see all your tasks."
                action={
                  <button type="button" className="btn btn--ghost" onClick={clearFilters}>
                    Clear filters
                  </button>
                }
              />
            </div>
          ) : (
            <TaskList
              tasks={visibleTasks}
              today={today}
              onToggle={toggleTask}
              onEdit={(task) => setForm({ open: true, task })}
              onDelete={setTaskToDelete}
            />
          )}
        </>
      )}

      <Modal open={form.open} title={form.task ? 'Edit task' : 'Add task'} onClose={() => setForm({ open: false, task: null })}>
        <TaskForm
          task={form.task}
          subjects={subjects}
          today={today}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ open: false, task: null })}
        />
      </Modal>

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Delete this task?"
        message={taskToDelete ? `"${taskToDelete.title}" will be removed permanently.` : ''}
        confirmLabel="Delete task"
        onConfirm={handleDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </>
  );
}
