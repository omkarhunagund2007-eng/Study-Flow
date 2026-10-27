import NavList from './NavList.jsx';

/** Mobile navigation: a bar fixed to the bottom, easy to reach with a thumb. */
export default function BottomNav({ route }) {
  return (
    <nav className="bottom-nav" aria-label="Main (mobile)">
      <NavList route={route} short />
    </nav>
  );
}
