import { useEffect, useId, useRef } from 'react';
import Icon from './Icon.jsx';

/**
 * A dialog built on the browser's native <dialog> element. The browser gives us
 * focus trapping, the Escape key and a dimmed backdrop for free.
 * The content is only rendered while open, so forms start fresh each time.
 */
export default function Modal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.classList.toggle('modal-open', open);
    return () => document.body.classList.remove('modal-open');
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault(); // we close it ourselves, through React state
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose(); // click on the dimmed backdrop
      }}
    >
      {open && (
        <div className="modal__panel">
          <div className="modal__header">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close dialog">
              <Icon name="x" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
