export default function Brand() {
  return (
    <div className="brand">
      <svg className="brand__mark" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="9" fill="var(--primary)" />
        <path d="M7 20c4.5-9 8.5 5 12.5-3.5s5-1.5 5.5-1.5" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="brand__name">StudyFlow</span>
    </div>
  );
}
