import { useApp } from '../context/AppContext.jsx';
import Icon from './Icon.jsx';

/** Switches between light and dark. The choice is saved by the AppContext. */
export default function ThemeToggle({ showLabel = false }) {
  const { theme, toggleTheme } = useApp();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={showLabel ? 'btn btn--ghost btn--block' : 'btn btn--ghost btn--icon'}
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      {showLabel && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}
