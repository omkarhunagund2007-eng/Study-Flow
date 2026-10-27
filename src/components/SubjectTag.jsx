import { useApp } from '../context/AppContext.jsx';
import { NO_SUBJECT } from '../utils/constants.js';

/** A coloured dot + subject name. Unknown or deleted subjects show as "No subject". */
export default function SubjectTag({ subjectId }) {
  const { subjects } = useApp();
  const subject = subjects.find((item) => item.id === subjectId) ?? NO_SUBJECT;

  return (
    <span className="subject-tag">
      <span className="subject-tag__dot" style={{ backgroundColor: subject.color }} aria-hidden="true" />
      <span className="subject-tag__name">{subject.name}</span>
    </span>
  );
}
