import { Mark, mergeAttributes } from '@tiptap/core';

export const EditorNoteMark = Mark.create({
  name: 'editorNote',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: element =>
          element.getAttribute('data-note-id') ??
          element.closest('[data-note-id]')?.getAttribute('data-note-id'),
        renderHTML: attributes => ({
          'data-note-id': attributes.noteId,
        }),
      },
      noteText: {
        default: '',
        parseHTML: element => element.getAttribute('data-note-text') ?? '',
        renderHTML: attributes => ({
          'data-note-text': attributes.noteText ?? '',
        }),
      },
      quotedText: {
        default: '',
        parseHTML: element => element.getAttribute('data-quoted-text') ?? '',
        renderHTML: attributes => ({
          'data-quoted-text': attributes.quotedText ?? '',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.tiptap-note-mark-wrap[data-note-id]',
      },
      {
        tag: 'span.tiptap-note-mark[data-note-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const noteId = HTMLAttributes.noteId;
    const noteText = HTMLAttributes.noteText ?? '';
    const quotedText = HTMLAttributes.quotedText ?? '';

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'tiptap-note-mark-wrap',
      }),
      [
        'button',
        {
          type: 'button',
          class: 'tiptap-note-tag',
          'data-note-id': noteId,
          'data-note-text': noteText,
          'data-quoted-text': quotedText,
          contenteditable: 'false',
          tabindex: '-1',
          'aria-label': 'View note',
        },
        'Note',
      ],
      [
        'span',
        {
          class: 'tiptap-note-mark',
          'data-note-id': noteId,
          'data-note-text': noteText,
          'data-quoted-text': quotedText,
        },
        0,
      ],
    ];
  },
});
