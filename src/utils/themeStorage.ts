export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = '@partner/theme';

export function getStoredTheme(): ThemeMode {
   try {
      const value = localStorage.getItem(THEME_STORAGE_KEY);
      return value === 'dark' ? 'dark' : 'light';
   } catch {
      return 'light';
   }
}

export function setStoredTheme(mode: ThemeMode): void {
   try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
   } catch {
      // Ignore storage failures (private browsing, etc.)
   }
}

export function applyThemeToDocument(mode: ThemeMode): void {
   document.documentElement.dataset.theme = mode;
}
