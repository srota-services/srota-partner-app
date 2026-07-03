import type { Editor } from '@tiptap/react';
import type { EditorView } from '@tiptap/pm/view';

export function createNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function removeNoteMarkFromEditor(editor: Editor, noteId: string): void {
  const { state } = editor;
  const markType = state.schema.marks.editorNote;
  if (!markType) {
    return;
  }

  let tr = state.tr;
  state.doc.descendants((node, pos) => {
    if (!node.isText) {
      return;
    }

    const hasNoteMark = node.marks.some(
      mark => mark.type.name === 'editorNote' && mark.attrs.noteId === noteId
    );
    if (hasNoteMark) {
      tr = tr.removeMark(pos, pos + node.text!.length, markType);
    }
  });

  if (tr.docChanged) {
    editor.view.dispatch(tr);
  }
}

export function findNoteIdFromElement(element: Element): string | null {
  const candidates = [
    element.closest('.tiptap-note-tag'),
    element.closest('.tiptap-note-mark'),
    element.closest('.tiptap-note-mark-wrap'),
  ].filter((candidate): candidate is Element => candidate !== null);

  for (const candidate of candidates) {
    const id = candidate.getAttribute('data-note-id');
    if (id) {
      return id;
    }
  }

  const wrap = element.closest('.tiptap-note-mark-wrap');
  const nested = wrap?.querySelector('[data-note-id]');
  return nested?.getAttribute('data-note-id') ?? null;
}

function getEditorNoteIdAtPos(view: EditorView, pos: number): string | null {
  const noteMark = view.state.doc
    .resolve(pos)
    .marks()
    .find(mark => mark.type.name === 'editorNote');

  const noteId = noteMark?.attrs.noteId;
  return typeof noteId === 'string' && noteId.length > 0 ? noteId : null;
}

export function resolveNoteIdFromNoteClick(
  view: EditorView,
  element: Element
): string | null {
  const fromDom = findNoteIdFromElement(element);
  if (fromDom) {
    return fromDom;
  }

  const wrap = element.closest('.tiptap-note-mark-wrap');
  if (!wrap) {
    return null;
  }

  const markTextEl = wrap.querySelector('.tiptap-note-mark');
  if (markTextEl) {
    try {
      const pos = view.posAtDOM(markTextEl, 0);
      const noteId = getEditorNoteIdAtPos(view, pos);
      if (noteId) {
        return noteId;
      }
    } catch {
      // Try coordinate fallback below.
    }
  }

  const rect = (element as HTMLElement).getBoundingClientRect();
  const coords = view.posAtCoords({
    left: rect.left + Math.min(4, rect.width / 2),
    top: rect.bottom + 2,
  });
  if (coords) {
    return getEditorNoteIdAtPos(view, coords.pos);
  }

  return null;
}

export function isEditorNoteClickTarget(element: Element): boolean {
  return (
    element.closest('.tiptap-note-tag') !== null ||
    element.closest('.tiptap-note-mark-wrap') !== null ||
    element.closest('.tiptap-note-mark') !== null
  );
}
