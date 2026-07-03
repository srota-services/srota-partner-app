/**
 * PramukhIME integration for Indian language typing in the chapter editor.
 *
 * The developer library only auto-attaches to input/textarea elements. Tiptap uses
 * contenteditable, so transliteration is bridged manually in TiptapEditor via the
 * keyboard plugin's process() API (see src/utils/pramukhTiptap.ts).
 */
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PRAMUKH_LANGUAGE_ID } from '../constants/pramukhLanguages';
import {
  applyPramukhLanguage,
  isPramukhLoaded,
  resetPramukhKeyboard,
} from '../utils/pramukhTiptap';

const PRAMUKH_LOAD_POLL_MS = 100;
const PRAMUKH_LOAD_MAX_ATTEMPTS = 50;

export function usePramukhIME(languageId: string = DEFAULT_PRAMUKH_LANGUAGE_ID) {
  const [isAvailable, setIsAvailable] = useState(() => isPramukhLoaded());

  const applyLanguage = useCallback((nextLanguageId: string) => {
    if (!isPramukhLoaded()) {
      return false;
    }

    resetPramukhKeyboard();
    return applyPramukhLanguage(nextLanguageId);
  }, []);

  useEffect(() => {
    if (isPramukhLoaded()) {
      setIsAvailable(true);
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;

      if (isPramukhLoaded()) {
        setIsAvailable(true);
        window.clearInterval(timer);
        return;
      }

      if (attempts >= PRAMUKH_LOAD_MAX_ATTEMPTS) {
        window.clearInterval(timer);
      }
    }, PRAMUKH_LOAD_POLL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!isAvailable) {
      return;
    }

    applyLanguage(languageId);
  }, [applyLanguage, isAvailable, languageId]);

  return { isAvailable, applyLanguage };
}
