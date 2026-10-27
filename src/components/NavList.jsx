import { ROUTES } from '../utils/routes.js';
import Icon from './Icon.jsx';

/**
 * The page links, used by both the desktop sidebar and the mobile bottom bar.
 * They are ordinary <a href="#/tasks"> links, so keyboard users, the back
 * button and "open in new tab" all work without any extra code.
 */
export default function NavList({ route, short = false }) {
  return (
    <ul className="nav-list">
      {ROUTES.map((item) => (
        <li key={item.path}>
          <a
            className="nav-link"
            href={`#/${item.path}`}
            aria-current={route === item.path ? 'page' : undefined}
          >
            <Icon name={item.icon} size={short ? 22 : 20} />
            <span>{short ? item.shortLabel : item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
