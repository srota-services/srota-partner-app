import { describe, expect, it, vi, beforeEach } from 'vitest';
import themeReducer, {
  initializeTheme,
  setTheme,
  toggleTheme,
} from '../src/store/slices/themeSlice';
import * as themeStorage from '../src/utils/themeStorage';

vi.mock('../src/utils/themeStorage', () => ({
  getStoredTheme: vi.fn(() => 'light' as const),
  setStoredTheme: vi.fn(),
  applyThemeToDocument: vi.fn(),
}));

const mockedGetStoredTheme = vi.mocked(themeStorage.getStoredTheme);
const mockedSetStoredTheme = vi.mocked(themeStorage.setStoredTheme);
const mockedApplyThemeToDocument = vi.mocked(themeStorage.applyThemeToDocument);

describe('themeSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetStoredTheme.mockReturnValue('light');
  });

  it('defaults to light mode', () => {
    const state = themeReducer(undefined, { type: 'unknown' });
    expect(state.mode).toBe('light');
    expect(state.initialized).toBe(false);
  });

  it('initializeTheme restores stored preference', () => {
    mockedGetStoredTheme.mockReturnValue('dark');

    const state = themeReducer(undefined, initializeTheme());

    expect(state.mode).toBe('dark');
    expect(state.initialized).toBe(true);
    expect(mockedApplyThemeToDocument).toHaveBeenCalledWith('dark');
    expect(mockedSetStoredTheme).toHaveBeenCalledWith('dark');
  });

  it('setTheme updates mode and persists', () => {
    const state = themeReducer(undefined, setTheme('dark'));

    expect(state.mode).toBe('dark');
    expect(mockedApplyThemeToDocument).toHaveBeenCalledWith('dark');
    expect(mockedSetStoredTheme).toHaveBeenCalledWith('dark');
  });

  it('toggleTheme switches between light and dark', () => {
    const lightState = themeReducer(undefined, setTheme('light'));
    const darkState = themeReducer(lightState, toggleTheme());

    expect(darkState.mode).toBe('dark');
    expect(mockedApplyThemeToDocument).toHaveBeenLastCalledWith('dark');

    const backToLight = themeReducer(darkState, toggleTheme());
    expect(backToLight.mode).toBe('light');
    expect(mockedApplyThemeToDocument).toHaveBeenLastCalledWith('light');
  });
});
