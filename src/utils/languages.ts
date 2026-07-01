import type { LanguageItem } from './audiobookApi';

export interface LanguageSelectOption {
  value: string;
  label: string;
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
  if (typeof audiobookLanguage === 'string' && audiobookLanguage.trim()) {
    return audiobookLanguage.trim();
  }

  if (
    audiobookLanguage &&
    typeof audiobookLanguage === 'object' &&
    'name' in audiobookLanguage &&
    typeof (audiobookLanguage as { name?: unknown }).name === 'string'
  ) {
    return (audiobookLanguage as { name: string }).name;
  }

  return resolveDefaultLanguageName(languages, fallback);
}
