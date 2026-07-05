import { PRAMUKH_KEYBOARD, resolvePramukhLanguageKey } from '../constants/pramukhLanguages';

export interface PramukhProcessResult {
  G: boolean;
  H: number;
  V: string;
}

interface PramukhKeyboardPlugin {
  process: (
    charCode: number,
    ctrlKey: boolean,
    altKey: boolean
  ) => PramukhProcessResult;
  reset: () => void;
}

export function isPramukhLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.pramukhIME);
}

export function getPramukhKeyboard(): PramukhKeyboardPlugin | null {
  const ime = window.pramukhIME;
  if (!ime?.kn) {
    return null;
  }

  const keyboard = ime.kn(PRAMUKH_KEYBOARD);
  if (!keyboard || typeof keyboard.process !== 'function') {
    return null;
  }

  return keyboard as PramukhKeyboardPlugin;
}

export function applyPramukhLanguage(languageId: string): boolean {
  if (!isPramukhLoaded()) {
    return false;
  }

  const languageKey = resolvePramukhLanguageKey(languageId);
  if (!languageKey) {
    return false;
  }

  window.pramukhIME?.setLanguage(languageKey, PRAMUKH_KEYBOARD);
  return true;
}

export function processPramukhKeyPress(
  charCode: number,
  ctrlKey: boolean,
  altKey: boolean
): { handled: boolean; deleteCount: number; text: string } {
  const keyboard = getPramukhKeyboard();
  if (!keyboard) {
    return { handled: false, deleteCount: 0, text: '' };
  }

  const result = keyboard.process(charCode, ctrlKey, altKey);
  if (!result.G) {
    return { handled: false, deleteCount: 0, text: '' };
  }

  return {
    handled: true,
    deleteCount: result.H,
    text: result.V,
  };
}

export function resetPramukhKeyboard(): void {
  getPramukhKeyboard()?.reset();
}

/** Keys that reset PramukhIME transliteration state (mirrors library keyup handler). */
export function shouldResetPramukhOnKey(keyCode: number): boolean {
  return (
    (keyCode >= 33 && keyCode <= 40) ||
    keyCode === 8 ||
    keyCode === 13 ||
    keyCode === 46
  );
}
