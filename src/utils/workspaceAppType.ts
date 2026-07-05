import type { LoginAppType } from '../types/auth';

const WORKSPACE_APP_TYPE_KEY = 'srota_partner_workspace_app_type';

const VALID_APP_TYPES = new Set<LoginAppType>(['organization', 'author']);

function isValidAppType(value: string): value is LoginAppType {
  return VALID_APP_TYPES.has(value as LoginAppType);
}

export function getStoredAppType(): LoginAppType | null {
  try {
    const stored = localStorage.getItem(WORKSPACE_APP_TYPE_KEY)?.trim();
    if (!stored || !isValidAppType(stored)) {
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export function setStoredAppType(appType: LoginAppType): void {
  try {
    localStorage.setItem(WORKSPACE_APP_TYPE_KEY, appType);
  } catch {
    // ignore storage errors
  }
}

export function clearStoredAppType(): void {
  try {
    localStorage.removeItem(WORKSPACE_APP_TYPE_KEY);
  } catch {
    // ignore storage errors
  }
}
