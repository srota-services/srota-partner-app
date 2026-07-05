const STORAGE_KEY = 'settingsReturnPath';
const DEFAULT_RETURN_PATH = '/dashboard';

export function trackSettingsReturnPath(pathname: string, search: string): void {
  if (pathname.startsWith('/settings')) {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, `${pathname}${search}`);
}

export function getSettingsReturnPath(): string {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored && !stored.startsWith('/settings')) {
    return stored;
  }

  return DEFAULT_RETURN_PATH;
}
