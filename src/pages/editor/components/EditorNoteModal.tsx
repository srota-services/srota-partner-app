import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';

interface EditorNoteModalProps {
  isOpen: boolean;
  quotedText: string;
  noteText?: string;
  mode?: 'create' | 'view';
  onClose: () => void;
  onSave?: (noteText: string) => void;
  onDelete?: () => void;
}

function EditorNoteModal({
  isOpen,
  quotedText,
  noteText = '',
  mode = 'create',
  onClose,
  onSave,
  onDelete,
}: EditorNoteModalProps) {
  const [draftNoteText, setDraftNoteText] = useState('');
  const isViewMode = mode === 'view';

  useEffect(() => {
    if (isOpen && !isViewMode) {
      setDraftNoteText('');
    }
  }, [isOpen, isViewMode, quotedText]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!onSave) {
      return;
    }

    const trimmed = draftNoteText.trim();
    if (!trimmed) {
      return;
    }

    onSave(trimmed);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Note' : 'Add note'}
      size="medium"
    >
      {isViewMode ? (
        <div className="editor-note-form">
          <div className="editor-note-form-field">
            <p className="editor-note-form-label">Selected text</p>
            <blockquote className="editor-note-selection">{quotedText}</blockquote>
          </div>

          <div className="editor-note-form-field">
            <p className="editor-note-form-label">Note</p>
            <p className="editor-note-view-text">{noteText}</p>
          </div>

          <div className="editor-note-form-actions editor-note-form-actions--split">
            {onDelete && (
              <button
                type="button"
                className="editor-note-btn editor-note-btn--danger"
                onClick={onDelete}
              >
                Delete note
              </button>
            )}
            <button
              type="button"
              className="editor-note-btn editor-note-btn--primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form className="editor-note-form" onSubmit={handleSubmit}>
          <div className="editor-note-form-field">
            <label htmlFor="editor-note-selection" className="editor-note-form-label">
              Selected text
            </label>
            <blockquote id="editor-note-selection" className="editor-note-selection">
              {quotedText || 'No text selected'}
            </blockquote>
          </div>

          <div className="editor-note-form-field">
            <label htmlFor="editor-note-text" className="editor-note-form-label">
              Note
            </label>
            <textarea
              id="editor-note-text"
              className="editor-note-textarea"
              rows={4}
              value={draftNoteText}
              onChange={event => setDraftNoteText(event.target.value)}
              placeholder="Write your note..."
              autoFocus
            />
          </div>

          <div className="editor-note-form-actions">
            <button
              type="button"
              className="editor-note-btn editor-note-btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="editor-note-btn editor-note-btn--primary"
              disabled={!draftNoteText.trim()}
            >
              Save note
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default EditorNoteModal;
