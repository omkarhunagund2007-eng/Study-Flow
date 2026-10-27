import { formatClock } from '../utils/format.js';

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The big clock with a ring that slowly empties as time runs out. */
export default function TimerDial({ remainingMs, progress, modeLabel, statusLabel }) {
  return (
    <div className="dial">
      <svg className="dial__svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <circle className="dial__track" cx="100" cy="100" r={RADIUS} />
        <circle
          className="dial__progress"
          cx="100"
          cy="100"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * progress}
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="dial__center">
        <p className="dial__time" role="timer" aria-label={`${modeLabel} time remaining`}>
          {formatClock(remainingMs)}
        </p>
        <p className="dial__label">
          {modeLabel}: {statusLabel}
        </p>
      </div>
    </div>
  );
}
