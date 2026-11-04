import { createContext, useContext, type ReactNode } from 'react';
import { useTheme, type Theme } from '@/lib/useTheme';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, toggle } = useTheme();
  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export function useThemeCtx(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useThemeCtx must be used within ThemeProvider');
  return ctx;
}
