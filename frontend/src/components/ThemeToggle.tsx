import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="relative inline-flex h-9 w-[4.5rem] shrink-0 items-center rounded-full bg-zinc-800 p-1 shadow-inner ring-1 ring-zinc-700/60 dark:bg-zinc-900 dark:ring-zinc-600/50"
    >
      <span
        aria-hidden
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-zinc-600 shadow-md transition-transform duration-300 ease-out dark:bg-zinc-700 ${
          isDark ? 'translate-x-[2.125rem]' : 'translate-x-0'
        }`}
      />
      <Sun
        className={`relative z-10 ml-1.5 h-4 w-4 transition-colors ${
          !isDark ? 'text-white' : 'text-zinc-500'
        }`}
        strokeWidth={2}
      />
      <Moon
        className={`relative z-10 ml-auto mr-1.5 h-4 w-4 transition-colors ${
          isDark ? 'text-zinc-200' : 'text-zinc-500'
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
