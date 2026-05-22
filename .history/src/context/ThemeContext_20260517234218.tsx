import React, { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from './ThemeContextValue';

// Theme types are declared in `ThemeContextValue.ts` to keep
// context shape and provider in separate files for fast-refresh safety.

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved) return saved;
    } catch {
      // ignore
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // i st
    if (theme === 'dark') root.classList.add('light');  
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => setTheme((t: Theme) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Note: `useTheme` hook is exported from a separate file to keep this module
// focused on the provider/component and avoid Fast Refresh issues.



