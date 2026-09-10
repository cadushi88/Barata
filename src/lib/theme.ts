import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

/**
 * Inline script text, injected into <head> so it runs before first paint.
 * Keeps the anti-flash logic in one place, shared with the SSR head config.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    // localStorage unavailable (private mode, disabled) - fall back to system
  }
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

/**
 * Manual light/dark override on top of the OS preference. `theme` is always
 * "system" during SSR and the first client render (matching what the server
 * sent, so hydration doesn't mismatch); an effect swaps in the real stored
 * value right after mount, matching the attribute THEME_INIT_SCRIPT already
 * set on <html> before paint.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore - the theme still applies for this page load
    }
  }, []);

  return { theme, setTheme };
}
