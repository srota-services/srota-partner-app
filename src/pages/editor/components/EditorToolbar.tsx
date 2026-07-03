import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  RotateCcw,
  RotateCw,
  StickyNote,
  Strikethrough,
  Underline as UnderlineIcon,
  ZoomIn,
  ZoomOut,
  Highlighter,
  type LucideIcon,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import SolidIcon from '../../../components/common/SolidIcon';
import Select from '../../../components/common/Select';
import { TEXT_HIGHLIGHT_COLOR } from '../../../constants/editorHighlight';
import PramukhLanguageSelector from './PramukhLanguageSelector';

const HEADING_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: '1', label: 'Heading 1' },
  { value: '2', label: 'Heading 2' },
  { value: '3', label: 'Heading 3' },
];

interface EditorToolbarProps {
  editor: Editor | null;
  pramukhLanguageId: string;
  onPramukhLanguageChange: (languageId: string) => void;
  isPramukhAvailable: boolean;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canAddNote: boolean;
  onAddNote: () => void;
}

function ToolbarOutlineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon size={16} strokeWidth={2} aria-hidden="true" />;
}

function ToolbarButton({
  label,
  isActive,
  disabled,
  onClick,
  children,
}: {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`editor-toolbar-btn${isActive ? ' editor-toolbar-btn--active' : ''}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function getHeadingValue(editor: Editor): string {
  if (editor.isActive('heading', { level: 1 })) {
    return '1';
  }
  if (editor.isActive('heading', { level: 2 })) {
    return '2';
  }
  if (editor.isActive('heading', { level: 3 })) {
    return '3';
  }
  return 'paragraph';
}

function setHeadingLevel(editor: Editor, value: string): void {
  if (value === 'paragraph') {
    editor.chain().focus().setParagraph().run();
    return;
  }

  const level = Number(value) as 1 | 2 | 3;
  editor.chain().focus().toggleHeading({ level }).run();
}

function EditorToolbar({
  editor,
  pramukhLanguageId,
  onPramukhLanguageChange,
  isPramukhAvailable,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  canAddNote,
  onAddNote,
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-group" role="toolbar" aria-label="Text formatting">
        <div className="editor-toolbar-heading-select">
          <label htmlFor="editor-heading-level" className="editor-toolbar-sr-only">
            Heading level
          </label>
          <Select
            id="editor-heading-level"
            fieldSize="sm"
            placeholder={false}
            options={HEADING_OPTIONS}
            value={getHeadingValue(editor)}
            onChange={event => setHeadingLevel(editor, event.target.value)}
            aria-label="Heading level"
          />
        </div>

        <ToolbarButton
          label="Bold"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <SolidIcon icon={Bold} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <SolidIcon icon={Italic} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <SolidIcon icon={UnderlineIcon} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <SolidIcon icon={Strikethrough} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Highlight"
          isActive={editor.isActive('highlight')}
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color: TEXT_HIGHLIGHT_COLOR }).run()
          }
        >
          <SolidIcon icon={Highlighter} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <SolidIcon icon={List} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <SolidIcon icon={ListOrdered} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <SolidIcon icon={Quote} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Add note"
          disabled={!canAddNote}
          onClick={onAddNote}
        >
          <SolidIcon icon={StickyNote} size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <ToolbarOutlineIcon icon={RotateCcw} />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <ToolbarOutlineIcon icon={RotateCw} />
        </ToolbarButton>

        <div className="editor-toolbar-divider" aria-hidden="true" />

        <ToolbarButton
          label="Zoom out"
          disabled={zoomLevel <= 80}
          onClick={onZoomOut}
        >
          <ToolbarOutlineIcon icon={ZoomOut} />
        </ToolbarButton>
        <span className="editor-toolbar-zoom-label" aria-live="polite">
          {zoomLevel}%
        </span>
        <ToolbarButton
          label="Zoom in"
          disabled={zoomLevel >= 150}
          onClick={onZoomIn}
        >
          <ToolbarOutlineIcon icon={ZoomIn} />
        </ToolbarButton>
      </div>

      <PramukhLanguageSelector
        value={pramukhLanguageId}
        onChange={onPramukhLanguageChange}
        isAvailable={isPramukhAvailable}
      />
    </div>
  );
}

export default EditorToolbar;
