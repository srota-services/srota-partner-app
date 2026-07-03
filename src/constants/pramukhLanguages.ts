export interface PramukhLanguageOption {
  id: string;
  label: string;
  languageKey: string;
}

/** Keyboard plugin bundled with the PramukhIME JavaScript library. */
export const PRAMUKH_KEYBOARD = 'pramukhindic';

/** All 23 Indian languages supported by PramukhIME. */
export const PRAMUKH_LANGUAGES: PramukhLanguageOption[] = [
  { id: 'assamese', label: 'Assamese', languageKey: 'assamese' },
  { id: 'bengali', label: 'Bengali', languageKey: 'bengali' },
  { id: 'bodo', label: 'Bodo', languageKey: 'bodo' },
  { id: 'dogri', label: 'Dogri', languageKey: 'dogri' },
  { id: 'gujarati', label: 'Gujarati', languageKey: 'gujarati' },
  { id: 'hindi', label: 'Hindi', languageKey: 'hindi' },
  { id: 'kannada', label: 'Kannada', languageKey: 'kannada' },
  { id: 'kashmiri', label: 'Kashmiri', languageKey: 'kashmiri' },
  { id: 'konkani', label: 'Konkani', languageKey: 'konkani' },
  { id: 'maithili', label: 'Maithili', languageKey: 'maithili' },
  { id: 'malayalam', label: 'Malayalam', languageKey: 'malayalam' },
  { id: 'manipuri', label: 'Manipuri', languageKey: 'manipuri' },
  { id: 'marathi', label: 'Marathi', languageKey: 'marathi' },
  { id: 'marathi-modi', label: 'Marathi (Modi)', languageKey: 'marathimodi' },
  { id: 'meitei', label: 'Meitei', languageKey: 'meitei' },
  { id: 'nepali', label: 'Nepali', languageKey: 'nepali' },
  { id: 'odiya', label: 'Odiya', languageKey: 'odia' },
  { id: 'punjabi', label: 'Punjabi', languageKey: 'punjabi' },
  { id: 'sanskrit', label: 'Sanskrit', languageKey: 'sanskrit' },
  { id: 'santali', label: 'Santali', languageKey: 'santali' },
  { id: 'sora', label: 'Sora', languageKey: 'sora' },
  { id: 'sindhi', label: 'Sindhi', languageKey: 'sindhi' },
  { id: 'tamil', label: 'Tamil', languageKey: 'tamil' },
  { id: 'telugu', label: 'Telugu', languageKey: 'telugu' },
];

export const DEFAULT_PRAMUKH_LANGUAGE_ID = 'hindi';

export function resolvePramukhLanguageKey(languageId: string): string | null {
  const option = PRAMUKH_LANGUAGES.find(item => item.id === languageId);
  return option?.languageKey ?? null;
}
