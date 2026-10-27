import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from './Icon.jsx';

/**
 * A short confirmation message ("Task added"). The wrapper is always in the page
 * with role="status", which makes screen readers announce new messages politely.
 */
export default function Toast() {
  const { toast, dismissToast } = useApp();

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(dismissToast, 6000);
    return () => clearTimeout(id);
  }, [toast, dismissToast]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className={`toast toast--${toast.tone}`} key={toast.id}>
          <span>{toast.message}</span>
          <button type="button" className="btn btn--ghost btn--icon btn--sm" onClick={dismissToast} aria-label="Dismiss message">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
