import type { LanguageItem } from './audiobookApi';

export interface LanguageSelectOption {
  value: string;
  label: string;
}

function extractAudiobookLanguageRaw(
  audiobookLanguage: unknown
): string | undefined {
  if (typeof audiobookLanguage === 'string' && audiobookLanguage.trim()) {
    return audiobookLanguage.trim();
  }

  if (audiobookLanguage && typeof audiobookLanguage === 'object') {
    const value = audiobookLanguage as { name?: unknown; code?: unknown };

    if (typeof value.name === 'string' && value.name.trim()) {
      return value.name.trim();
    }

    if (typeof value.code === 'string' && value.code.trim()) {
      return value.code.trim();
    }
  }

  return undefined;
}

function resolveLanguageNameFromRaw(
  raw: string,
  languages: LanguageItem[]
): string {
  const normalized = raw.toLowerCase();

  const byName = languages.find(
    language => language.name.toLowerCase() === normalized
  );
  if (byName) {
    return byName.name;
  }

  const byCode = languages.find(
    language => language.code.toLowerCase() === normalized
  );
  if (byCode) {
    return byCode.name;
  }

  return raw;
}

export function buildLanguageSelectOptions(
  languages: LanguageItem[]
): LanguageSelectOption[] {
  return languages.map(language => ({
    value: language.name,
    label: language.name,
  }));
}

export function resolveDefaultLanguageName(
  languages: LanguageItem[],
  fallback = 'English'
): string {
  if (languages.length === 0) {
    return fallback;
  }

  const english = languages.find(
    language =>
      language.code.toLowerCase() === 'en' ||
      language.name.toLowerCase() === 'english'
  );

  return english?.name ?? languages[0]?.name ?? fallback;
}

export function resolveAudiobookLanguageName(
  audiobookLanguage: unknown,
  languages: LanguageItem[],
  fallback = 'English'
): string {
  const raw = extractAudiobookLanguageRaw(audiobookLanguage);
  if (!raw) {
    return resolveDefaultLanguageName(languages, fallback);
  }

  return resolveLanguageNameFromRaw(raw, languages);
}

export function audiobookMatchesLanguageFilter(
  audiobookLanguage: unknown,
  languageFilter: string,
  languages: LanguageItem[]
): boolean {
  if (languageFilter === 'all') {
    return true;
  }

  return (
    resolveAudiobookLanguageName(audiobookLanguage, languages) === languageFilter
  );
}
