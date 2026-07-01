import { describe, expect, it } from 'vitest';
import {
  buildLanguageSelectOptions,
  resolveAudiobookLanguageName,
  resolveDefaultLanguageName,
} from '../src/utils/languages';
import type { LanguageItem } from '../src/utils/audiobookApi';

const mockLanguages: LanguageItem[] = [
  {
    id: 'lang-hi',
    name: 'Hindi',
    code: 'hi',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'lang-en',
    name: 'English',
    code: 'en',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('language utils', () => {
  it('builds select options from API languages', () => {
    expect(buildLanguageSelectOptions(mockLanguages)).toEqual([
      { value: 'Hindi', label: 'Hindi' },
      { value: 'English', label: 'English' },
    ]);
  });

  it('resolves English as the default language when available', () => {
    expect(resolveDefaultLanguageName(mockLanguages)).toBe('English');
  });

  it('falls back to the first language when English is unavailable', () => {
    expect(resolveDefaultLanguageName([mockLanguages[0]!])).toBe('Hindi');
  });

  it('resolves audiobook language from a string value', () => {
    expect(resolveAudiobookLanguageName('Spanish', mockLanguages)).toBe(
      'Spanish'
    );
  });

  it('resolves audiobook language from a nested language object', () => {
    expect(
      resolveAudiobookLanguageName({ name: 'Hindi' }, mockLanguages)
    ).toBe('Hindi');
  });
});
