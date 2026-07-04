import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/react';
import type { EditorNote } from '../../../types/editor';
import { DEFAULT_PRAMUKH_LANGUAGE_ID } from '../../../constants/pramukhLanguages';
import { usePramukhIME } from '../../../hooks/usePramukhIME';
import { createNoteId, removeNoteMarkFromEditor, findNoteByIdInRichText, findNoteFromElement } from '../../../utils/editorNotes';
import { isEditorSaveShortcut } from '../../../utils/editorSaveShortcut';
import EditorToolbar from './EditorToolbar';
import EditorNoteModal from './EditorNoteModal';
import TiptapEditor from '../../../components/editor/TiptapEditor';

const MIN_ZOOM = 80;
const MAX_ZOOM = 150;
const ZOOM_STEP = 10;

interface EditorWorkspaceProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  pageTitle: string;
  pageId: string | null;
  notes: EditorNote[];
  onAddNote: (note: Omit<EditorNote, 'createdAt'>) => void;
  onDeleteNote: (noteId: string) => void;
  onEditorInstanceChange?: (editor: Editor | null) => void;
  onSave: () => void;
  canSave: boolean;
  isSaving: boolean;
}

function EditorWorkspace({
  content,
  onChange,
  pageTitle,
  pageId,
  notes,
  onAddNote,
  onDeleteNote,
  onEditorInstanceChange,
  onSave,
  canSave,
  isSaving,
}: EditorWorkspaceProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pramukhLanguageId, setPramukhLanguageId] = useState(
    DEFAULT_PRAMUKH_LANGUAGE_ID
  );
  const [zoomLevel, setZoomLevel] = useState(100);
  const [hasSelection, setHasSelection] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<EditorNote | null>(null);
  const [noteSelectionText, setNoteSelectionText] = useState('');
  const noteSelectionRangeRef = useRef<{ from: number; to: number } | null>(null);
  const notesRef = useRef(notes);
  const { isAvailable } = usePramukhIME(pramukhLanguageId);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    onEditorInstanceChange?.(editor);
  }, [editor, onEditorInstanceChange]);

  const updateSelectionState = useCallback(() => {
    if (!editor) {
      setHasSelection(false);
      return;
    }

    const { from, to } = editor.state.selection;
    setHasSelection(to > from);
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.on('selectionUpdate', updateSelectionState);
    editor.on('transaction', updateSelectionState);
    updateSelectionState();

    return () => {
      editor.off('selectionUpdate', updateSelectionState);
      editor.off('transaction', updateSelectionState);
    };
  }, [editor, updateSelectionState]);

  const openNoteView = useCallback((note: EditorNote) => {
    setIsCreateNoteOpen(false);
    setViewingNote(note);
  }, []);

  const handleOpenNoteModal = () => {
    if (!editor || !pageId) {
      return;
    }

    const { from, to } = editor.state.selection;
    if (to <= from) {
      return;
    }

    setViewingNote(null);
    noteSelectionRangeRef.current = { from, to };
    setNoteSelectionText(editor.state.doc.textBetween(from, to, ' '));
    setIsCreateNoteOpen(true);
  };

  const handleSaveNote = (noteText: string) => {
    if (!editor || !pageId || !noteSelectionText.trim()) {
      return;
    }

    const noteId = createNoteId();
    const range = noteSelectionRangeRef.current;

    if (range) {
      editor
        .chain()
        .focus()
        .setTextSelection(range)
        .setMark('editorNote', {
          noteId,
          noteText,
          quotedText: noteSelectionText.trim(),
        })
        .run();
      onChange(editor.getJSON());
    }

    onAddNote({
      id: noteId,
      pageId,
      quotedText: noteSelectionText,
      noteText,
    });

    noteSelectionRangeRef.current = null;
    setIsCreateNoteOpen(false);
  };

  const handleNoteTagClick = useCallback(
    (noteId: string, clickTarget?: Element) => {
      let note = notesRef.current.find(item => item.id === noteId);

      if (!note && clickTarget && pageId) {
        note = findNoteFromElement(clickTarget, pageId) ?? undefined;
      }

      if (!note && editor && pageId) {
        note = findNoteByIdInRichText(editor.getJSON(), pageId, noteId) ?? undefined;
      }

      if (note) {
        openNoteView(note);
      }
    },
    [editor, openNoteView, pageId]
  );

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      if (editor) {
        removeNoteMarkFromEditor(editor, noteId);
        onChange(editor.getJSON());
      }

      onDeleteNote(noteId);
      setViewingNote(null);
    },
    [editor, onChange, onDeleteNote]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEditorSaveShortcut(event) || !canSave) {
        return;
      }

      event.preventDefault();
      onSave();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canSave, onSave]);

  return (
    <div className="editor-workspace">
      <div className="editor-workspace-header">
        <h1 className="editor-workspace-title">{pageTitle}</h1>
      </div>

      <EditorToolbar
        editor={editor}
        pramukhLanguageId={pramukhLanguageId}
        onPramukhLanguageChange={setPramukhLanguageId}
        isPramukhAvailable={isAvailable}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP))}
        onZoomOut={() => setZoomLevel(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP))}
        canAddNote={hasSelection}
        onAddNote={handleOpenNoteModal}
        onSave={onSave}
        canSave={canSave}
        isSaving={isSaving}
      />

      <div className="editor-workspace-body">
        <TiptapEditor
          content={content}
          onChange={onChange}
          placeholder="Start writing this page..."
          onEditorReady={setEditor}
          pramukhEnabled={isAvailable}
          zoomLevel={zoomLevel}
          onNoteTagClick={handleNoteTagClick}
        />
      </div>

      <EditorNoteModal
        key={viewingNote ? `view-${viewingNote.id}` : isCreateNoteOpen ? 'create' : 'closed'}
        mode={viewingNote ? 'view' : 'create'}
        isOpen={viewingNote !== null || isCreateNoteOpen}
        quotedText={viewingNote?.quotedText ?? noteSelectionText}
        noteText={viewingNote?.noteText ?? ''}
        onClose={() => {
          setViewingNote(null);
          setIsCreateNoteOpen(false);
        }}
        onSave={viewingNote ? undefined : handleSaveNote}
        onDelete={viewingNote ? () => handleDeleteNote(viewingNote.id) : undefined}
      />
    </div>
  );
}

export default EditorWorkspace;
