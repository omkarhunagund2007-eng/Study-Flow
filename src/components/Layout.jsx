import { useEffect, useRef } from 'react';
import { ROUTES } from '../utils/routes.js';
import Sidebar from './Sidebar.jsx';
import MobileHeader from './MobileHeader.jsx';
import BottomNav from './BottomNav.jsx';
import StorageNotices from './StorageNotices.jsx';
import Toast from './Toast.jsx';

/**
 * The frame around every page: sidebar (desktop), top bar + bottom bar (mobile)
 * and the <main> area where the current page is shown (`children`).
 */
export default function Layout({ route, children }) {
  const mainRef = useRef(null);
  const previousRoute = useRef(route);

  // On every page change: update the browser tab title and move keyboard/screen-reader
  // focus to the page content (like a normal page load would).
  // We compare with the previous route instead of using an "is first render" flag,
  // because React's StrictMode runs effects twice in development and a flag would break.
  useEffect(() => {
    const page = ROUTES.find((item) => item.path === route);
    document.title = `${page ? page.label : 'StudyFlow'} - StudyFlow`;
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    // preventScroll: focusing a far-down element must not make the page jump,
    // so we scroll to the top ourselves (the sticky mobile header would hide the title otherwise).
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <div className="app-shell">
      {/* A button (not a link) because links would change the URL hash and the page. */}
      <button type="button" className="skip-link" onClick={() => mainRef.current?.focus({ preventScroll: true })}>
        Skip to main content
      </button>
      <Sidebar route={route} />
      <MobileHeader />
      <main id="main" className="main" ref={mainRef} tabIndex={-1}>
        <StorageNotices />
        {children}
      </main>
      <BottomNav route={route} />
      <Toast />
    </div>
  );
}
