import { ChevronRight } from 'lucide-react';
import type { EditorBreadcrumb } from '../../../types/editor';
import '../../../styles/pages/editor/Editor.css';

interface EditorContextPanelProps {
  breadcrumb: EditorBreadcrumb | null;
  isDirty?: boolean;
}

function EditorContextPanel({ breadcrumb, isDirty = false }: EditorContextPanelProps) {
  if (!breadcrumb) {
    return (
      <div className="editor-context-panel">
        <p className="editor-context-empty">Select a page to begin editing.</p>
      </div>
    );
  }

  return (
    <div className="editor-context-panel">
      <p className="editor-context-label">Currently editing</p>
      <nav className="editor-context-breadcrumb" aria-label="Editor context">
        <span className="editor-context-crumb">{breadcrumb.audiobookTitle}</span>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="editor-context-crumb">
          Ch. {breadcrumb.chapterNumber}: {breadcrumb.chapterTitle}
        </span>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="editor-context-crumb editor-context-crumb--active">
          {breadcrumb.pageLabel}
        </span>
      </nav>
      <div className="editor-context-meta">
        <span className="editor-context-badge">{breadcrumb.pageLabel}</span>
        {isDirty ? (
          <span className="editor-context-status editor-context-status--dirty">
            Unsaved changes
          </span>
        ) : (
          <span className="editor-context-status">Saved locally</span>
        )}
      </div>
    </div>
  );
}

export default EditorContextPanel;
