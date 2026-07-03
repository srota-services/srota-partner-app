import { useEditor, EditorContent, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useRef } from 'react';
import { EditorNoteMark } from './EditorNoteMark';
import {
  processPramukhKeyPress,
  resetPramukhKeyboard,
  shouldResetPramukhOnKey,
} from '../../utils/pramukhTiptap';
import {
  isEditorNoteClickTarget,
  resolveNoteIdFromNoteClick,
} from '../../utils/editorNotes';
import '../../styles/components/editor/TiptapEditor.css';

export interface TiptapEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  onEditorReady?: (editor: Editor) => void;
  pramukhEnabled?: boolean;
  zoomLevel?: number;
  onNoteTagClick?: (noteId: string) => void;
}

function applyPramukhResult(
  editor: Editor,
  deleteCount: number,
  text: string
): void {
  const { from } = editor.state.selection;
  const chain = editor.chain().focus();

  if (deleteCount > 0) {
    chain.deleteRange({
      from: Math.max(0, from - deleteCount),
      to: from,
    });
  }

  if (text.length > 0) {
    chain.insertContent(text);
  }

  chain.run();
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing this page...',
  editable = true,
  className = '',
  onEditorReady,
  pramukhEnabled = false,
  zoomLevel = 100,
  onNoteTagClick,
}) => {
  const editorRef = useRef<Editor | null>(null);
  const pramukhEnabledRef = useRef(pramukhEnabled);
  const onNoteTagClickRef = useRef(onNoteTagClick);
  const isInternalUpdateRef = useRef(false);

  useEffect(() => {
    pramukhEnabledRef.current = pramukhEnabled;
  }, [pramukhEnabled]);

  useEffect(() => {
    onNoteTagClickRef.current = onNoteTagClick;
  }, [onNoteTagClick]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      EditorNoteMark,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor: currentEditor }) => {
      isInternalUpdateRef.current = true;
      onChange(currentEditor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-body',
        'data-testid': 'tiptap-editor-body',
      },
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target;
          if (!(target instanceof Element)) {
            return false;
          }

          if (!isEditorNoteClickTarget(target)) {
            return false;
          }

          const noteId = resolveNoteIdFromNoteClick(view, target);
          if (!noteId) {
            return false;
          }

          event.preventDefault();
          event.stopPropagation();
          onNoteTagClickRef.current?.(noteId);
          return true;
        },
        keypress: (_view, event) => {
          if (!pramukhEnabledRef.current) {
            return false;
          }

          const currentEditor = editorRef.current;
          if (!currentEditor) {
            return false;
          }

          const charCode = event.charCode || 0;
          if (charCode === 0) {
            return false;
          }

          const result = processPramukhKeyPress(
            charCode,
            event.ctrlKey || event.metaKey,
            event.altKey
          );

          if (!result.handled) {
            return false;
          }

          event.preventDefault();
          applyPramukhResult(currentEditor, result.deleteCount, result.text);
          return true;
        },
        keyup: (_view, event) => {
          if (!pramukhEnabledRef.current) {
            return false;
          }

          if (shouldResetPramukhOnKey(event.keyCode)) {
            resetPramukhKeyboard();
          }

          return false;
        },
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const currentJson = JSON.stringify(editor.getJSON());
    const nextJson = JSON.stringify(content);

    if (currentJson !== nextJson) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div
      className={`tiptap-editor ${className}`.trim()}
      style={{ '--editor-zoom': `${zoomLevel / 100}` } as React.CSSProperties}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
