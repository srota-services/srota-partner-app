import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorNoteMark } from '../src/components/editor/EditorNoteMark';
import { removeNoteMarkFromEditor } from '../src/utils/editorNotes';

describe('editorNotes', () => {
  it('removes an editor note mark by id', () => {
    const editor = new Editor({
      extensions: [StarterKit, EditorNoteMark],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'annotated text',
                marks: [{ type: 'editorNote', attrs: { noteId: 'note-1' } }],
              },
            ],
          },
        ],
      },
    });

    removeNoteMarkFromEditor(editor, 'note-1');

    const marks = editor.state.doc.firstChild?.firstChild?.marks ?? [];
    expect(marks.some(mark => mark.type.name === 'editorNote')).toBe(false);

    editor.destroy();
  });
});
