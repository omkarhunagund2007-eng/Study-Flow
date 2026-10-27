import { useId, useRef, useState, useEffect } from 'react';
import { SUBJECT_COLORS } from '../utils/constants.js';
import { validateSubject } from '../utils/validation.js';
import FormField from './FormField.jsx';
import Icon from './Icon.jsx';

/** Picks the first palette colour that no subject uses yet, so new subjects look different. */
function pickDefaultColor(subjects) {
  const used = new Set(subjects.map((subject) => subject.color));
  return (SUBJECT_COLORS.find((color) => !used.has(color.value)) ?? SUBJECT_COLORS[0]).value;
}

/** Add / edit form for a subject: a name (no duplicates) and a colour. */
export default function SubjectForm({ subject, subjects, onSubmit, onCancel }) {
  const uid = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState({
    name: subject?.name ?? '',
    color: subject?.color ?? pickDefaultColor(subjects),
  });
  const [errors, setErrors] = useState({});
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts > 0) formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [attempts]);

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateSubject(values, { subjects, editingId: subject?.id ?? null });
    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors);
      setAttempts((count) => count + 1);
      return;
    }
    onSubmit(result.values);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="form">
      <FormField id={`${uid}-name`} label="Subject name" error={errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            autoComplete="off"
            aria-required="true"
            value={values.name}
            onChange={(event) => {
              setValues((current) => ({ ...current, name: event.target.value }));
              setErrors((current) => ({ ...current, name: undefined }));
            }}
          />
        )}
      </FormField>

      <fieldset className="color-picker">
        <legend>Color</legend>
        <div className="color-picker__options">
          {SUBJECT_COLORS.map((color) => {
            const selected = values.color === color.value;
            return (
              <label key={color.value} className="swatch">
                <input
                  type="radio"
                  name={`${uid}-color`}
                  value={color.value}
                  checked={selected}
                  onChange={() => setValues((current) => ({ ...current, color: color.value }))}
                />
                <span className="swatch__dot" style={{ backgroundColor: color.value }}>
                  {selected && <Icon name="check" size={16} />}
                </span>
                <span className="visually-hidden">{color.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="form-actions form-actions--start">
        <button type="submit" className="btn btn--primary">
          {subject ? 'Save subject' : 'Add subject'}
        </button>
        {subject && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
