import { useEffect, useRef, useState } from 'react';

interface EditorTreeLabelProps {
  value: string;
  ariaLabel: string;
  onRename: (nextValue: string) => void;
  onClick?: () => void;
  autoEdit?: boolean;
  onAutoEditHandled?: () => void;
}

function EditorTreeLabel({
  value,
  ariaLabel,
  onRename,
  onClick,
  autoEdit = false,
  onAutoEditHandled,
}: EditorTreeLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  useEffect(() => {
    if (autoEdit) {
      setIsEditing(true);
      onAutoEditHandled?.();
    }
  }, [autoEdit, onAutoEditHandled]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className="editor-tree-rename-input"
        value={draft}
        aria-label={`Rename ${ariaLabel}`}
        onChange={event => setDraft(event.target.value)}
        onBlur={commitRename}
        onClick={event => event.stopPropagation()}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitRename();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setDraft(value);
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <span
      className="editor-tree-label"
      title="Double-click to rename"
      onClick={onClick}
      onDoubleClick={event => {
        event.stopPropagation();
        setIsEditing(true);
      }}
    >
      {value}
    </span>
  );
}

export default EditorTreeLabel;
