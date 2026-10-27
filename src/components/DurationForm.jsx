import { useId, useState } from 'react';
import { DEFAULT_DURATIONS, DURATION_LIMITS } from '../utils/constants.js';
import { validateDurations } from '../utils/validation.js';
import FormField from './FormField.jsx';

// The visible labels are short so the three inputs line up; screen readers also hear "length in minutes".
const FIELDS = [
  { key: 'focus', label: 'Focus' },
  { key: 'short', label: 'Short break' },
  { key: 'long', label: 'Long break' },
];

/** Lets the user change the three timer lengths. Values are kept as text while typing. */
export default function DurationForm({ durations, onSave }) {
  const uid = useId();
  const [text, setText] = useState({
    focus: String(durations.focus),
    short: String(durations.short),
    long: String(durations.long),
  });
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateDurations(text);
    setErrors(result.errors);
    if (Object.keys(result.errors).length === 0) onSave(result.values);
  }

  function handleRestore() {
    setText({
      focus: String(DEFAULT_DURATIONS.focus),
      short: String(DEFAULT_DURATIONS.short),
      long: String(DEFAULT_DURATIONS.long),
    });
    setErrors({});
    onSave(DEFAULT_DURATIONS, 'Timer lengths restored to 25 / 5 / 15 minutes.');
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <p className="muted">Length of each timer, in minutes.</p>
      <div className="form-row form-row--three">
        {FIELDS.map(({ key, label }) => (
          <FormField
            key={key}
            id={`${uid}-${key}`}
            label={
              <>
                {label}
                <span className="visually-hidden"> length in minutes</span>
              </>
            }
            error={errors[key]}
          >
            {(props) => (
              <input
                {...props}
                type="number"
                inputMode="numeric"
                min={DURATION_LIMITS[key].min}
                max={DURATION_LIMITS[key].max}
                value={text[key]}
                onChange={(event) => {
                  setText((current) => ({ ...current, [key]: event.target.value }));
                  setErrors((current) => ({ ...current, [key]: undefined }));
                }}
              />
            )}
          </FormField>
        ))}
      </div>
      <div className="form-actions form-actions--start">
        <button type="submit" className="btn btn--primary">Save lengths</button>
        <button type="button" className="btn btn--ghost" onClick={handleRestore}>Restore defaults</button>
      </div>
    </form>
  );
}
