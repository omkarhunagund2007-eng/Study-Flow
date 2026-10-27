import Brand from './Brand.jsx';
import ThemeToggle from './ThemeToggle.jsx';

/** Top bar on phones and tablets (hidden on desktop by CSS). */
export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <Brand />
      <ThemeToggle />
    </header>
  );
}
