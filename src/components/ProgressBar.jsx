export default function ProgressBar({ value, label }) {
  const safe = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe}>
      <div className="progress__fill" style={{ width: `${safe}%` }} />
    </div>
  );
}
