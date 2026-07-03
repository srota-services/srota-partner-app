import { describe, expect, it } from 'vitest';
import { getPageTransitionKey } from '../src/utils/pageTransitionKey';

describe('getPageTransitionKey', () => {
  it('uses a stable key for editor deep-links', () => {
    expect(getPageTransitionKey('/editor')).toBe('/editor');
    expect(getPageTransitionKey('/editor/ab/ch/pg')).toBe('/editor');
  });

  it('uses the pathname for other routes', () => {
    expect(getPageTransitionKey('/dashboard')).toBe('/dashboard');
    expect(getPageTransitionKey('/library/1/chapters')).toBe('/library/1/chapters');
  });
});
