export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = '@partner/theme';

/** Public marketing/auth routes that always render in light mode. */
export const LIGHT_ONLY_ROUTES = ['/', '/login', '/partner/register'] as const;

export function isLightOnlyRoute(pathname: string): boolean {
   return LIGHT_ONLY_ROUTES.includes(
      pathname as (typeof LIGHT_ONLY_ROUTES)[number]
   );
}

export function resolveDocumentTheme(
   mode: ThemeMode,
   pathname: string
): ThemeMode {
   if (isLightOnlyRoute(pathname)) {
      return 'light';
   }
   return mode;
}

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
   if (mode === 'dark') {
      document.documentElement.dataset.theme = 'dark';
      return;
   }

   delete document.documentElement.dataset.theme;
}
