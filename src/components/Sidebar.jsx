import Brand from './Brand.jsx';
import NavList from './NavList.jsx';
import ThemeToggle from './ThemeToggle.jsx';

/** Desktop navigation (hidden on small screens by CSS). */
export default function Sidebar({ route }) {
  return (
    <aside className="sidebar">
      <Brand />
      <nav aria-label="Main">
        <NavList route={route} />
      </nav>
      <div className="sidebar__footer">
        <ThemeToggle showLabel />
      </div>
    </aside>
  );
}
