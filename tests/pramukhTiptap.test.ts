import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyPramukhLanguage,
  processPramukhKeyPress,
  shouldResetPramukhOnKey,
} from '../src/utils/pramukhTiptap';

describe('pramukhTiptap', () => {
  afterEach(() => {
    delete window.pramukhIME;
  });
  it('sets language with the pramukhindic keyboard plugin', () => {
    const setLanguage = vi.fn();
    const process = vi.fn().mockReturnValue({ G: false, H: 0, V: '' });
    const reset = vi.fn();

    window.pramukhIME = {
      setLanguage,
      enable: vi.fn(),
      disable: vi.fn(),
      kn: () => ({ process, reset }),
    };

    expect(applyPramukhLanguage('hindi')).toBe(true);
    expect(setLanguage).toHaveBeenCalledWith('hindi', 'pramukhindic');
  });

  it('maps odiya selection to the odia language key', () => {
    const setLanguage = vi.fn();

    window.pramukhIME = {
      setLanguage,
      enable: vi.fn(),
      disable: vi.fn(),
      kn: () => ({ process: vi.fn(), reset: vi.fn() }),
    };

    applyPramukhLanguage('odiya');
    expect(setLanguage).toHaveBeenCalledWith('odia', 'pramukhindic');
  });

  it('bridges keypress output into editor-friendly insert/delete counts', () => {
    const process = vi.fn().mockReturnValue({ G: true, H: 1, V: 'क' });

    window.pramukhIME = {
      setLanguage: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      kn: () => ({ process, reset: vi.fn() }),
    };

    expect(processPramukhKeyPress(107, false, false)).toEqual({
      handled: true,
      deleteCount: 1,
      text: 'क',
    });
    expect(process).toHaveBeenCalledWith(107, false, false);
  });

  it('identifies navigation keys that reset transliteration state', () => {
    expect(shouldResetPramukhOnKey(37)).toBe(true);
    expect(shouldResetPramukhOnKey(65)).toBe(false);
  });
});
