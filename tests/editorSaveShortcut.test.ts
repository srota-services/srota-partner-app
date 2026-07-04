import { describe, expect, it } from 'vitest';
import {
  getEditorSaveShortcutLabel,
  isEditorSaveShortcut,
} from '../src/utils/editorSaveShortcut';

describe('editorSaveShortcut', () => {
  it('detects ctrl+s and cmd+s', () => {
    expect(
      isEditorSaveShortcut(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      )
    ).toBe(true);
    expect(
      isEditorSaveShortcut(
        new KeyboardEvent('keydown', { key: 'S', metaKey: true })
      )
    ).toBe(true);
    expect(
      isEditorSaveShortcut(new KeyboardEvent('keydown', { key: 's' }))
    ).toBe(false);
  });

  it('returns a save shortcut label', () => {
    expect(getEditorSaveShortcutLabel()).toMatch(/^(Ctrl\+S|Cmd\+S)$/);
  });
});
