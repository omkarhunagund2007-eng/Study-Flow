import { useEffect, useId, useRef, useState } from 'react';
import { PRIORITIES } from '../utils/constants.js';
import { validateTask } from '../utils/validation.js';
import FormField from './FormField.jsx';

/**
 * Add / edit form for a task. If `task` is given the form starts filled in (edit mode).
 * It validates when you press Save and shows the problems next to each field.
 * Only valid, cleaned values are sent to `onSubmit`.
 */
export default function TaskForm({ task, subjects, today, onSubmit, onCancel }) {
  const uid = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    subjectId: task?.subjectId ?? '',
    deadline: task?.deadline ?? today,
    priority: task?.priority ?? 'medium',
  });
  const [errors, setErrors] = useState({});
  const [attempts, setAttempts] = useState(0);

  // After a failed save, move focus to the first field with a problem.
  useEffect(() => {
    if (attempts > 0) formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [attempts]);

  function handleChange(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    };
  }

  function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    const result = validateTask(values, { subjects });
    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors);
      setAttempts((count) => count + 1);
      return;
    }
    onSubmit(result.values);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="form">
      <FormField id={`${uid}-title`} label="Title" error={errors.title}>
        {(props) => <input {...props} type="text" autoComplete="off" aria-required="true" value={values.title} onChange={handleChange('title')} />}
      </FormField>

      <FormField id={`${uid}-description`} label="Description" optional error={errors.description}>
        {(props) => <textarea {...props} rows={3} value={values.description} onChange={handleChange('description')} />}
      </FormField>

      <div className="form-row">
        <FormField id={`${uid}-subject`} label="Subject" optional error={errors.subjectId}
          hint={subjects.length === 0 ? 'No subjects yet. Add some on the Subjects page.' : undefined}>
          {(props) => (
            <select {...props} value={values.subjectId} onChange={handleChange('subjectId')}>
              <option value="">No subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField id={`${uid}-priority`} label="Priority" error={errors.priority}>
          {(props) => (
            <select {...props} value={values.priority} onChange={handleChange('priority')}>
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <FormField id={`${uid}-deadline`} label="Deadline" error={errors.deadline} hint="Dates in the past will be marked overdue.">
        {(props) => <input {...props} type="date" aria-required="true" value={values.deadline} onChange={handleChange('deadline')} />}
      </FormField>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">{task ? 'Save changes' : 'Add task'}</button>
      </div>
    </form>
  );
}
