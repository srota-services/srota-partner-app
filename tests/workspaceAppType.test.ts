import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearStoredAppType,
  getStoredAppType,
  setStoredAppType,
} from '../src/utils/workspaceAppType';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe('workspaceAppType storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    clearStoredAppType();
    vi.unstubAllGlobals();
  });

  it('stores and retrieves a valid appType', () => {
    setStoredAppType('organization');
    expect(getStoredAppType()).toBe('organization');

    setStoredAppType('author');
    expect(getStoredAppType()).toBe('author');
  });

  it('returns null for invalid stored values', () => {
    localStorage.setItem('srota_partner_workspace_app_type', 'invalid');
    expect(getStoredAppType()).toBeNull();
  });

  it('clears stored appType', () => {
    setStoredAppType('organization');
    clearStoredAppType();
    expect(getStoredAppType()).toBeNull();
  });
});
