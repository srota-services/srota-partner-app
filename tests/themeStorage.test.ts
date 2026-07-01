import { describe, expect, it } from 'vitest';
import {
  isLightOnlyRoute,
  resolveDocumentTheme,
} from '../src/utils/themeStorage';

describe('themeStorage route rules', () => {
  it('treats landing, login, and signup as light-only routes', () => {
    expect(isLightOnlyRoute('/')).toBe(true);
    expect(isLightOnlyRoute('/login')).toBe(true);
    expect(isLightOnlyRoute('/partner/register')).toBe(true);
  });

  it('allows dark mode on authenticated app routes', () => {
    expect(isLightOnlyRoute('/dashboard')).toBe(false);
    expect(isLightOnlyRoute('/library')).toBe(false);
  });

  it('forces light theme on public routes even when preference is dark', () => {
    expect(resolveDocumentTheme('dark', '/login')).toBe('light');
    expect(resolveDocumentTheme('dark', '/')).toBe('light');
    expect(resolveDocumentTheme('dark', '/partner/register')).toBe('light');
  });

  it('keeps dark theme on app routes when preference is dark', () => {
    expect(resolveDocumentTheme('dark', '/dashboard')).toBe('dark');
  });
});
