/**
 * Label + input + hint + error message, wired together for accessibility.
 * `children` is a FUNCTION that receives the props the input needs
 * (id, aria-invalid, aria-describedby) - a pattern called "render props":
 *
 *   <FormField id="x" label="Title" error={errors.title}>
 *     {(inputProps) => <input {...inputProps} value={...} onChange={...} />}
 *   </FormField>
 */
export default function FormField({ id, label, optional = false, hint, error, children }) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ');

  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="muted"> (optional)</span>}
      </label>
      {children({
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy || undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="field__hint muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
