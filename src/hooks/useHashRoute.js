import { useEffect, useState } from 'react';
import { getRouteFromHash } from '../utils/routes.js';

/** Returns the current page name ("tasks", "timer", ...) and follows the URL hash. */
export function useHashRoute() {
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(getRouteFromHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
