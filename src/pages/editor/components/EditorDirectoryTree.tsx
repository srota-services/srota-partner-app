import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EditorAudiobook, EditorSelection, EditorTreeRenameTarget } from '../../../types/editor';
import {
  canDeleteAudiobook,
  canDeleteChapter,
  canDeletePage,
  getPageLabel,
} from '../../../utils/editorTreeMutations';
import SolidIcon from '../../../components/common/SolidIcon';
import EditorTreeLabel from './EditorTreeLabel';

interface EditorDirectoryTreeProps {
  audiobooks: EditorAudiobook[];
  selection: EditorSelection | null;
  expandedAudiobooks: Set<string>;
  expandedChapters: Set<string>;
  onToggleAudiobook: (audiobookId: string) => void;
  onToggleChapter: (chapterId: string) => void;
  onSelectPage: (selection: EditorSelection) => void;
  onAddAudiobook: () => void;
  onAddChapter: (audiobookId: string) => void;
  onAddPage: (audiobookId: string, chapterId: string) => void;
  onDeleteAudiobook: (audiobookId: string) => void;
  onDeleteChapter: (audiobookId: string, chapterId: string) => void;
  onDeletePage: (audiobookId: string, chapterId: string, pageId: string) => void;
  onRenameAudiobook: (audiobookId: string, title: string) => void;
  onRenameChapter: (audiobookId: string, chapterId: string, title: string) => void;
  onRenamePage: (
    audiobookId: string,
    chapterId: string,
    pageId: string,
    label: string
  ) => void;
  renameTarget: EditorTreeRenameTarget | null;
  onRenameTargetHandled: () => void;
}

function TreeActionButton({
  label,
  icon,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      className="editor-tree-action-btn"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <SolidIcon icon={icon} size={14} />
    </button>
  );
}

function TreeRowActions({
  addLabel,
  deleteLabel,
  canDelete,
  onAdd,
  onDelete,
}: {
  addLabel: string;
  deleteLabel: string;
  canDelete: boolean;
  onAdd: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="editor-tree-actions">
      <TreeActionButton label={addLabel} icon={Plus} onClick={onAdd} />
      <TreeActionButton
        label={deleteLabel}
        icon={Trash2}
        disabled={!canDelete}
        onClick={onDelete}
      />
    </div>
  );
}

function EditorDirectoryTree({
  audiobooks,
  selection,
  expandedAudiobooks,
  expandedChapters,
  onToggleAudiobook,
  onToggleChapter,
  onSelectPage,
  onAddAudiobook,
  onAddChapter,
  onAddPage,
  onDeleteAudiobook,
  onDeleteChapter,
  onDeletePage,
  onRenameAudiobook,
  onRenameChapter,
  onRenamePage,
  renameTarget,
  onRenameTargetHandled,
}: EditorDirectoryTreeProps) {
  return (
    <div className="editor-directory-tree">
      <div className="editor-directory-header">
        <div className="editor-directory-header-row">
          <div>
            <h2 className="editor-directory-title">Library</h2>
            <p className="editor-directory-subtitle">Audiobooks, chapters, and pages</p>
          </div>
          <button
            type="button"
            className="editor-directory-add-btn"
            onClick={onAddAudiobook}
          >
            <SolidIcon icon={Plus} size={14} />
            Audiobook
          </button>
        </div>
      </div>

      <ul className="editor-tree-list" role="tree" aria-label="Audiobook directory">
        {audiobooks.map(audiobook => {
          const isAudiobookExpanded = expandedAudiobooks.has(audiobook.id);

          return (
            <li key={audiobook.id} className="editor-tree-node" role="none">
              <div className="editor-tree-row editor-tree-row--audiobook">
                <button
                  type="button"
                  className="editor-tree-toggle"
                  aria-expanded={isAudiobookExpanded}
                  aria-label={`Toggle ${audiobook.title}`}
                  onClick={() => onToggleAudiobook(audiobook.id)}
                >
                  <SolidIcon
                    icon={isAudiobookExpanded ? ChevronDown : ChevronRight}
                    size={14}
                    className="editor-tree-chevron"
                  />
                </button>
                <SolidIcon icon={BookOpen} size={16} className="editor-tree-icon" />
                <EditorTreeLabel
                  value={audiobook.title}
                  ariaLabel="audiobook"
                  onRename={title => onRenameAudiobook(audiobook.id, title)}
                  autoEdit={
                    renameTarget?.kind === 'audiobook' &&
                    renameTarget.audiobookId === audiobook.id
                  }
                  onAutoEditHandled={onRenameTargetHandled}
                />
                <TreeRowActions
                  addLabel={`Add chapter to ${audiobook.title}`}
                  deleteLabel={`Delete ${audiobook.title}`}
                  canDelete={canDeleteAudiobook(audiobooks)}
                  onAdd={event => {
                    event.stopPropagation();
                    onAddChapter(audiobook.id);
                  }}
                  onDelete={event => {
                    event.stopPropagation();
                    onDeleteAudiobook(audiobook.id);
                  }}
                />
              </div>

              {isAudiobookExpanded && (
                <ul className="editor-tree-children" role="group">
                  {audiobook.chapters.map(chapter => {
                    const isChapterExpanded = expandedChapters.has(chapter.id);

                    return (
                      <li key={chapter.id} className="editor-tree-node" role="none">
                        <div className="editor-tree-row editor-tree-row--chapter">
                          <button
                            type="button"
                            className="editor-tree-toggle"
                            aria-expanded={isChapterExpanded}
                            aria-label={`Toggle chapter ${chapter.title}`}
                            onClick={() => onToggleChapter(chapter.id)}
                          >
                            <SolidIcon
                              icon={isChapterExpanded ? ChevronDown : ChevronRight}
                              size={14}
                              className="editor-tree-chevron"
                            />
                          </button>
                          <SolidIcon
                            icon={FolderOpen}
                            size={16}
                            className="editor-tree-icon"
                          />
                          <EditorTreeLabel
                            value={`Ch. ${chapter.chapterNumber}: ${chapter.title}`}
                            ariaLabel="chapter"
                            onRename={title => {
                              const stripped = title.replace(/^ch\.\s*\d+:\s*/i, '').trim();
                              onRenameChapter(
                                audiobook.id,
                                chapter.id,
                                stripped || chapter.title
                              );
                            }}
                            autoEdit={
                              renameTarget?.kind === 'chapter' &&
                              renameTarget.audiobookId === audiobook.id &&
                              renameTarget.chapterId === chapter.id
                            }
                            onAutoEditHandled={onRenameTargetHandled}
                          />
                          <TreeRowActions
                            addLabel={`Add page to ${chapter.title}`}
                            deleteLabel={`Delete chapter ${chapter.title}`}
                            canDelete={canDeleteChapter(audiobook)}
                            onAdd={event => {
                              event.stopPropagation();
                              onAddPage(audiobook.id, chapter.id);
                            }}
                            onDelete={event => {
                              event.stopPropagation();
                              onDeleteChapter(audiobook.id, chapter.id);
                            }}
                          />
                        </div>

                        {isChapterExpanded && (
                          <ul className="editor-tree-children" role="group">
                            {chapter.pages.map(page => {
                              const isActive =
                                selection?.audiobookId === audiobook.id &&
                                selection.chapterId === chapter.id &&
                                selection.pageId === page.id;
                              const pageLabel = getPageLabel(page);

                              return (
                                <li key={page.id} className="editor-tree-node" role="none">
                                  <div
                                    role="treeitem"
                                    aria-selected={isActive}
                                    className={`editor-tree-row editor-tree-row--page${
                                      isActive ? ' editor-tree-row--active' : ''
                                    }`}
                                    onClick={() =>
                                      onSelectPage({
                                        audiobookId: audiobook.id,
                                        chapterId: chapter.id,
                                        pageId: page.id,
                                      })
                                    }
                                  >
                                    <span className="editor-tree-chevron editor-tree-chevron--spacer" />
                                    <SolidIcon
                                      icon={FileText}
                                      size={16}
                                      className="editor-tree-icon"
                                    />
                                    <EditorTreeLabel
                                      value={pageLabel}
                                      ariaLabel="page"
                                      onRename={label =>
                                        onRenamePage(
                                          audiobook.id,
                                          chapter.id,
                                          page.id,
                                          label
                                        )
                                      }
                                      autoEdit={
                                        renameTarget?.kind === 'page' &&
                                        renameTarget.audiobookId === audiobook.id &&
                                        renameTarget.chapterId === chapter.id &&
                                        renameTarget.pageId === page.id
                                      }
                                      onAutoEditHandled={onRenameTargetHandled}
                                    />
                                    <div className="editor-tree-actions">
                                      <TreeActionButton
                                        label={`Delete ${pageLabel}`}
                                        icon={Trash2}
                                        disabled={!canDeletePage(chapter)}
                                        onClick={event => {
                                          event.stopPropagation();
                                          onDeletePage(audiobook.id, chapter.id, page.id);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default EditorDirectoryTree;
