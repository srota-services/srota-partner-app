export function getEditorSaveShortcutLabel(): string {
  if (typeof navigator === 'undefined') {
    return 'Ctrl+S';
  }

  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? 'Cmd+S' : 'Ctrl+S';
}

export function isEditorSaveShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  if (key !== 's') {
    return false;
  }

  return event.metaKey || event.ctrlKey;
}
