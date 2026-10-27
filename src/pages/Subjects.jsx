import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { pluralize } from '../utils/format.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SubjectForm from '../components/SubjectForm.jsx';
import SubjectList from '../components/SubjectList.jsx';

export default function Subjects() {
  const { subjects, tasks, sessions, addSubject, updateSubject, deleteSubject, notify } = useApp();
  const [editing, setEditing] = useState(null); // the subject being edited, or null when adding
  const [formKey, setFormKey] = useState(0); // changing the key gives us a fresh, empty form
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  function handleSubmit(values) {
    if (editing) {
      updateSubject(editing.id, values);
      notify('Subject updated.');
      setEditing(null);
    } else {
      addSubject(values);
      notify(`Added subject "${values.name}".`);
      setFormKey((key) => key + 1);
    }
  }

  function handleDelete() {
    deleteSubject(subjectToDelete.id);
    notify(`Deleted subject "${subjectToDelete.name}". Its tasks were kept.`);
    if (editing?.id === subjectToDelete.id) setEditing(null);
    setSubjectToDelete(null);
  }

  const linkedTasks = subjectToDelete ? tasks.filter((task) => task.subjectId === subjectToDelete.id).length : 0;

  return (
    <>
      <PageHeader title="Subjects" description="Group your tasks and study time by subject." />

      <section className="card" aria-labelledby="subject-form-title">
        <h2 id="subject-form-title">{editing ? `Edit "${editing.name}"` : 'Add a subject'}</h2>
        <SubjectForm
          key={editing ? editing.id : `new-${formKey}`}
          subject={editing}
          subjects={subjects}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </section>

      {subjects.length === 0 ? (
        <div className="card">
          <EmptyState icon="subjects" title="No subjects yet" message="Add your first subject above, for example Math or History." />
        </div>
      ) : (
        <SubjectList subjects={subjects} tasks={tasks} sessions={sessions} editingId={editing?.id} onEdit={setEditing} onDelete={setSubjectToDelete} />
      )}

      <ConfirmDialog
        open={subjectToDelete !== null}
        title="Delete this subject?"
        message={
          subjectToDelete
            ? linkedTasks > 0
              ? `${pluralize(linkedTasks, 'task')} use "${subjectToDelete.name}". The tasks will NOT be deleted. They will be kept and shown as "No subject". Study history is kept too.`
              : `"${subjectToDelete.name}" will be removed. Any study history for it is kept under "No subject".`
            : ''
        }
        confirmLabel="Delete subject"
        onConfirm={handleDelete}
        onCancel={() => setSubjectToDelete(null)}
      />
    </>
  );
}
