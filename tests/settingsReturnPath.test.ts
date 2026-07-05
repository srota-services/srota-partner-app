import { afterEach, describe, expect, it } from 'vitest';
import {
  getSettingsReturnPath,
  trackSettingsReturnPath,
} from '../src/utils/settingsReturnPath';

describe('settingsReturnPath', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('stores non-settings routes as the return path', () => {
    trackSettingsReturnPath('/library', '?search=test');

    expect(sessionStorage.getItem('settingsReturnPath')).toBe('/library?search=test');
    expect(getSettingsReturnPath()).toBe('/library?search=test');
  });

  it('does not overwrite the return path while on settings', () => {
    trackSettingsReturnPath('/dashboard', '');
    trackSettingsReturnPath('/settings', '?section=user');

    expect(getSettingsReturnPath()).toBe('/dashboard');
  });

  it('falls back to dashboard when no return path is stored', () => {
    expect(getSettingsReturnPath()).toBe('/dashboard');
  });
});
