interface PramukhProcessResult {
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

interface PramukhIMEApi {
  setLanguage: (language: string, keyboard: string) => void;
  enable: () => void;
  disable: () => void;
  /** Returns the loaded keyboard plugin (e.g. pramukhindic). */
  kn: (keyboard?: string) => PramukhKeyboardPlugin | undefined;
}

declare global {
  interface Window {
    pramukhIME?: PramukhIMEApi;
  }
}

export {};
