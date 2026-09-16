'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';
const STORAGE_KEY = 'marilux:theme';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  /** False until the client has read the stored preference. */
  ready: boolean;
};

const Ctx = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/**
 * Inline bootstrap.
 *
 * This runs before first paint, so the correct theme is on `<html>` by the
 * time anything renders — no flash of the wrong palette, and no hydration
 * mismatch, because React never renders the attribute itself.
 */
export const themeInitScript = `(function(){try{
var s=localStorage.getItem('${STORAGE_KEY}');
var t=s==='light'||s==='dark'?s:'dark';
document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setThemeState(current === 'light' ? 'light' : 'dark');
    setReady(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing — the choice simply will not persist.
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [theme, setTheme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggle, ready }), [theme, setTheme, toggle, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
