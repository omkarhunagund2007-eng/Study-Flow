import Badge from './Badge.jsx';

const TONES = { high: 'danger', medium: 'warning', low: 'success' };
const LABELS = { high: 'High priority', medium: 'Medium priority', low: 'Low priority' };

export default function PriorityBadge({ priority }) {
  return <Badge tone={TONES[priority]}>{LABELS[priority]}</Badge>;
}
