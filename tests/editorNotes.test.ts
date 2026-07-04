import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorNoteMark } from '../src/components/editor/EditorNoteMark';
import {
  extractNotesFromRichText,
  findNoteByIdInRichText,
  removeNoteMarkFromEditor,
} from '../src/utils/editorNotes';

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

  it('extracts notes from richText with legacy noteId-only marks', () => {
    const richText = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'स्क्ति',
              marks: [
                {
                  type: 'editorNote',
                  attrs: { noteId: 'note-1783182641844-jufbn3' },
                },
              ],
            },
          ],
        },
      ],
    };

    const notes = extractNotesFromRichText(richText, 'page-1');

    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({
      id: 'note-1783182641844-jufbn3',
      pageId: 'page-1',
      quotedText: 'स्क्ति',
      noteText: '',
    });
    expect(notes[0]?.createdAt).toBe(new Date(1783182641844).toISOString());
  });

  it('extracts notes with persisted noteText and quotedText attrs', () => {
    const richText = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'hello',
              marks: [
                {
                  type: 'editorNote',
                  attrs: {
                    noteId: 'note-2',
                    noteText: 'My note',
                    quotedText: 'hello',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const note = findNoteByIdInRichText(richText, 'page-2', 'note-2');

    expect(note).toMatchObject({
      id: 'note-2',
      pageId: 'page-2',
      quotedText: 'hello',
      noteText: 'My note',
    });
  });
});
