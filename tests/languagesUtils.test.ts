import { describe, expect, it } from 'vitest';
import {
  audiobookMatchesLanguageFilter,
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

  it('resolves audiobook language from a language code', () => {
    expect(resolveAudiobookLanguageName('hi', mockLanguages)).toBe('Hindi');
    expect(resolveAudiobookLanguageName('en', mockLanguages)).toBe('English');
  });

  it('resolves audiobook language from a nested language code object', () => {
    expect(
      resolveAudiobookLanguageName({ code: 'hi' }, mockLanguages)
    ).toBe('Hindi');
  });

  it('matches audiobooks to the selected language filter by name or code', () => {
    expect(
      audiobookMatchesLanguageFilter('hi', 'Hindi', mockLanguages)
    ).toBe(true);
    expect(
      audiobookMatchesLanguageFilter({ code: 'en' }, 'English', mockLanguages)
    ).toBe(true);
    expect(
      audiobookMatchesLanguageFilter('Hindi', 'English', mockLanguages)
    ).toBe(false);
    expect(audiobookMatchesLanguageFilter('hi', 'all', mockLanguages)).toBe(
      true
    );
  });
});
