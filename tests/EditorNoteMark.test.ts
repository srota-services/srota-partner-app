import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorNoteMark } from '../src/components/editor/EditorNoteMark';

describe('EditorNoteMark', () => {
  it('renders note markup without a ProseMirror content-hole error', () => {
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

    expect(() => editor.getHTML()).not.toThrow();
    expect(editor.getHTML()).toContain('tiptap-note-tag');
    expect(editor.getHTML()).toContain('data-note-id="note-1"');
    expect(editor.getHTML()).toContain('annotated text');

    editor.destroy();
  });
});
