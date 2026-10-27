import { useApp } from '../context/AppContext.jsx';
import Icon from './Icon.jsx';

/** Warnings about LocalStorage problems: damaged saved data, or storage that cannot save. */
export default function StorageNotices() {
  const { dataWasDamaged, dismissDamageNotice, storageUnavailable } = useApp();

  return (
    <>
      {storageUnavailable && (
        <div className="notice notice--danger" role="alert">
          <Icon name="alert" />
          <p>
            Your browser is not letting StudyFlow save data (private browsing or full storage). You can keep using the
            app, but your changes will be lost when you close or refresh this page.
          </p>
        </div>
      )}
      {dataWasDamaged && (
        <div className="notice notice--warning" role="status">
          <Icon name="alert" />
          <p>
            Some saved data could not be read, so the unreadable parts were skipped. A backup copy of the original was
            kept in your browser storage.
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={dismissDamageNotice}>
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
