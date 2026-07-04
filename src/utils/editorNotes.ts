import type { Editor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/react';
import type { EditorView } from '@tiptap/pm/view';
import type { EditorNote } from '../types/editor';

export function createNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseNoteCreatedAt(noteId: string): string {
  const timestamp = Number(noteId.split('-')[1]);
  if (!Number.isNaN(timestamp) && timestamp > 0) {
    return new Date(timestamp).toISOString();
  }
  return new Date().toISOString();
}

function readNoteAttrsFromMark(mark: {
  attrs?: Record<string, unknown>;
}): { noteId: string; noteText: string; quotedText: string } | null {
  const noteId = mark.attrs?.noteId;
  if (typeof noteId !== 'string' || !noteId) {
    return null;
  }

  return {
    noteId,
    noteText: typeof mark.attrs?.noteText === 'string' ? mark.attrs.noteText : '',
    quotedText:
      typeof mark.attrs?.quotedText === 'string' ? mark.attrs.quotedText : '',
  };
}

export function extractNotesFromRichText(
  content: JSONContent,
  pageId: string
): EditorNote[] {
  const notes: EditorNote[] = [];
  const seen = new Set<string>();

  function walk(node: JSONContent): void {
    if (node.type === 'text' && Array.isArray(node.marks)) {
      const noteMark = node.marks.find(mark => mark.type === 'editorNote');
      const attrs = noteMark ? readNoteAttrsFromMark(noteMark) : null;

      if (attrs && !seen.has(attrs.noteId)) {
        seen.add(attrs.noteId);
        notes.push({
          id: attrs.noteId,
          pageId,
          quotedText: attrs.quotedText || node.text || '',
          noteText: attrs.noteText,
          createdAt: parseNoteCreatedAt(attrs.noteId),
        });
      }
    }

    node.content?.forEach(walk);
  }

  if (content.type) {
    walk(content);
  }

  return notes;
}

export function findNoteByIdInRichText(
  content: JSONContent,
  pageId: string,
  noteId: string
): EditorNote | null {
  return extractNotesFromRichText(content, pageId).find(note => note.id === noteId) ?? null;
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

export function findNoteFromElement(
  element: Element,
  pageId: string
): EditorNote | null {
  const candidates = [
    element.closest('.tiptap-note-tag'),
    element.closest('.tiptap-note-mark'),
    element.closest('.tiptap-note-mark-wrap'),
  ].filter((candidate): candidate is Element => candidate !== null);

  for (const candidate of candidates) {
    const noteId = candidate.getAttribute('data-note-id');
    if (!noteId) {
      continue;
    }

    return {
      id: noteId,
      pageId,
      quotedText: candidate.getAttribute('data-quoted-text') ?? '',
      noteText: candidate.getAttribute('data-note-text') ?? '',
      createdAt: parseNoteCreatedAt(noteId),
    };
  }

  return null;
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
