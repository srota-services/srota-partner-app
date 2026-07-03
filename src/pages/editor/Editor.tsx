import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { JSONContent } from '@tiptap/react';
import type { EditorAudiobook, EditorNote, EditorSelection, EditorTreeRenameTarget } from '../../types/editor';
import { useResizablePanel } from '../../hooks/useResizablePanel';
import { EDITOR_MOCK_AUDIOBOOKS } from '../../utils/editorMockData';
import {
  addAudiobook,
  addChapter,
  addPage,
  collectAudiobookPageIds,
  collectChapterPageIds,
  deleteAudiobook,
  deleteChapter,
  deletePage,
  renameAudiobook,
  renameChapter,
  renamePage,
} from '../../utils/editorTreeMutations';
import {
  buildEditorPath,
  findPageByIds,
  getDefaultSelection,
  getEditorBreadcrumb,
  isSelectionAffectedByDelete,
  parseEditorPathParams,
  resolveSelectionFromParams,
} from '../../utils/editorSelection';
import EditorContextPanel from './components/EditorContextPanel';
import EditorDirectoryTree from './components/EditorDirectoryTree';
import EditorWorkspace from './components/EditorWorkspace';
import '../../styles/pages/editor/Editor.css';

function getInitialExpandedSets(selection: EditorSelection | null): {
  audiobooks: Set<string>;
  chapters: Set<string>;
} {
  if (!selection) {
    return { audiobooks: new Set(), chapters: new Set() };
  }

  return {
    audiobooks: new Set([selection.audiobookId]),
    chapters: new Set([selection.chapterId]),
  };
}

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { audiobookId, chapterId, pageId } = parseEditorPathParams(location.pathname);

  const [audiobooks, setAudiobooks] = useState<EditorAudiobook[]>(() =>
    structuredClone(EDITOR_MOCK_AUDIOBOOKS)
  );
  const [pageDrafts, setPageDrafts] = useState<Record<string, JSONContent>>({});
  const [dirtyPages, setDirtyPages] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<EditorNote[]>([]);
  const [renameTarget, setRenameTarget] = useState<EditorTreeRenameTarget | null>(
    null
  );

  const selection = useMemo(
    () => resolveSelectionFromParams(audiobooks, audiobookId, chapterId, pageId),
    [audiobooks, audiobookId, chapterId, pageId]
  );

  const [expandedAudiobooks, setExpandedAudiobooks] = useState<Set<string>>(
    () => getInitialExpandedSets(selection).audiobooks
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    () => getInitialExpandedSets(selection).chapters
  );

  const { width: sidebarWidth, startResize, isResizing } = useResizablePanel({
    defaultWidth: 300,
    minWidth: 220,
    maxWidth: 520,
  });

  const selectionAudiobookId = selection?.audiobookId;
  const selectionChapterId = selection?.chapterId;
  const selectionPageId = selection?.pageId;

  useEffect(() => {
    if (!selectionAudiobookId || !selectionChapterId) {
      return;
    }

    setExpandedAudiobooks(prev => new Set(prev).add(selectionAudiobookId));
    setExpandedChapters(prev => new Set(prev).add(selectionChapterId));
  }, [selectionAudiobookId, selectionChapterId, selectionPageId]);

  const breadcrumb = useMemo(
    () => (selection ? getEditorBreadcrumb(audiobooks, selection) : null),
    [audiobooks, selection]
  );

  const currentPage = useMemo(() => {
    if (!selection) {
      return null;
    }
    return findPageByIds(audiobooks, selection)?.page ?? null;
  }, [audiobooks, selection]);

  const editorContent = useMemo(() => {
    if (!currentPage) {
      return { type: 'doc', content: [] } satisfies JSONContent;
    }

    return pageDrafts[currentPage.id] ?? currentPage.richText;
  }, [currentPage, pageDrafts]);

  const handleSelectPage = useCallback(
    (nextSelection: EditorSelection) => {
      setExpandedAudiobooks(prev => new Set(prev).add(nextSelection.audiobookId));
      setExpandedChapters(prev => new Set(prev).add(nextSelection.chapterId));
      navigate(buildEditorPath(nextSelection));
    },
    [navigate]
  );

  const handleToggleAudiobook = useCallback((audiobookIdToToggle: string) => {
    setExpandedAudiobooks(prev => {
      const next = new Set(prev);
      if (next.has(audiobookIdToToggle)) {
        next.delete(audiobookIdToToggle);
      } else {
        next.add(audiobookIdToToggle);
      }
      return next;
    });
  }, []);

  const handleToggleChapter = useCallback((chapterIdToToggle: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterIdToToggle)) {
        next.delete(chapterIdToToggle);
      } else {
        next.add(chapterIdToToggle);
      }
      return next;
    });
  }, []);

  const handleContentChange = useCallback(
    (content: JSONContent) => {
      if (!currentPage) {
        return;
      }

      setPageDrafts(prev => ({
        ...prev,
        [currentPage.id]: content,
      }));
      setDirtyPages(prev => new Set(prev).add(currentPage.id));
    },
    [currentPage]
  );

  const handleAddNote = useCallback(
    (note: Omit<EditorNote, 'createdAt'>) => {
      setNotes(prev => [
        ...prev,
        {
          ...note,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  const handleAddAudiobook = useCallback(() => {
    const next = addAudiobook(audiobooks);
    const created = next[next.length - 1];
    const chapter = created?.chapters[0];
    const page = chapter?.pages[0];

    if (!created || !chapter || !page) {
      return;
    }

    const nextSelection: EditorSelection = {
      audiobookId: created.id,
      chapterId: chapter.id,
      pageId: page.id,
    };

    setAudiobooks(next);
    setExpandedAudiobooks(prev => new Set(prev).add(created.id));
    setExpandedChapters(prev => new Set(prev).add(chapter.id));
    setRenameTarget({ kind: 'audiobook', audiobookId: created.id });
    navigate(buildEditorPath(nextSelection));
  }, [audiobooks, navigate]);

  const handleAddChapter = useCallback(
    (audiobookIdToUpdate: string) => {
      const next = addChapter(audiobooks, audiobookIdToUpdate);
      const audiobook = next.find(item => item.id === audiobookIdToUpdate);
      const chapter = audiobook?.chapters[audiobook.chapters.length - 1];
      const page = chapter?.pages[0];

      if (!chapter || !page) {
        return;
      }

      const nextSelection: EditorSelection = {
        audiobookId: audiobookIdToUpdate,
        chapterId: chapter.id,
        pageId: page.id,
      };

      setAudiobooks(next);
      setExpandedAudiobooks(prev => new Set(prev).add(audiobookIdToUpdate));
      setExpandedChapters(prev => new Set(prev).add(chapter.id));
      setRenameTarget({
        kind: 'chapter',
        audiobookId: audiobookIdToUpdate,
        chapterId: chapter.id,
      });
      navigate(buildEditorPath(nextSelection));
    },
    [audiobooks, navigate]
  );

  const handleAddPage = useCallback(
    (audiobookIdToUpdate: string, chapterIdToUpdate: string) => {
      const next = addPage(audiobooks, audiobookIdToUpdate, chapterIdToUpdate);
      const audiobook = next.find(item => item.id === audiobookIdToUpdate);
      const chapter = audiobook?.chapters.find(item => item.id === chapterIdToUpdate);
      const page = chapter?.pages[chapter.pages.length - 1];

      if (!page) {
        return;
      }

      const nextSelection: EditorSelection = {
        audiobookId: audiobookIdToUpdate,
        chapterId: chapterIdToUpdate,
        pageId: page.id,
      };

      setAudiobooks(next);
      setExpandedAudiobooks(prev => new Set(prev).add(audiobookIdToUpdate));
      setExpandedChapters(prev => new Set(prev).add(chapterIdToUpdate));
      setRenameTarget({
        kind: 'page',
        audiobookId: audiobookIdToUpdate,
        chapterId: chapterIdToUpdate,
        pageId: page.id,
      });
      navigate(buildEditorPath(nextSelection));
    },
    [audiobooks, navigate]
  );

  const handleRenameAudiobook = useCallback((audiobookIdToRename: string, title: string) => {
    setAudiobooks(prev => renameAudiobook(prev, audiobookIdToRename, title));
  }, []);

  const handleRenameChapter = useCallback(
    (audiobookIdToRename: string, chapterIdToRename: string, title: string) => {
      setAudiobooks(prev =>
        renameChapter(prev, audiobookIdToRename, chapterIdToRename, title)
      );
    },
    []
  );

  const handleRenamePage = useCallback(
    (
      audiobookIdToRename: string,
      chapterIdToRename: string,
      pageIdToRename: string,
      label: string
    ) => {
      setAudiobooks(prev =>
        renamePage(prev, audiobookIdToRename, chapterIdToRename, pageIdToRename, label)
      );
    },
    []
  );

  const removePageState = useCallback((pageIds: string[]) => {
    if (pageIds.length === 0) {
      return;
    }

    const pageIdSet = new Set(pageIds);
    setPageDrafts(prev => {
      const next = { ...prev };
      pageIds.forEach(pageId => {
        delete next[pageId];
      });
      return next;
    });
    setDirtyPages(prev => {
      const next = new Set(prev);
      pageIds.forEach(pageId => next.delete(pageId));
      return next;
    });
    setNotes(prev => prev.filter(note => !pageIdSet.has(note.pageId)));
  }, []);

  const handleDeleteAudiobook = useCallback(
    (audiobookIdToDelete: string) => {
      const audiobook = audiobooks.find(item => item.id === audiobookIdToDelete);
      if (!audiobook) {
        return;
      }

      const next = deleteAudiobook(audiobooks, audiobookIdToDelete);
      if (!next) {
        return;
      }

      const deletedPageIds = collectAudiobookPageIds(audiobook);
      setAudiobooks(next);
      removePageState(deletedPageIds);
      setExpandedAudiobooks(prev => {
        const updated = new Set(prev);
        updated.delete(audiobookIdToDelete);
        return updated;
      });
      setRenameTarget(prev =>
        prev?.audiobookId === audiobookIdToDelete ? null : prev
      );

      if (isSelectionAffectedByDelete(selection, { kind: 'audiobook', audiobookId: audiobookIdToDelete })) {
        const fallback = getDefaultSelection(next);
        if (fallback) {
          navigate(buildEditorPath(fallback));
        }
      }
    },
    [audiobooks, navigate, removePageState, selection]
  );

  const handleDeleteChapter = useCallback(
    (audiobookIdToDelete: string, chapterIdToDelete: string) => {
      const audiobook = audiobooks.find(item => item.id === audiobookIdToDelete);
      if (!audiobook) {
        return;
      }

      const next = deleteChapter(audiobooks, audiobookIdToDelete, chapterIdToDelete);
      if (!next) {
        return;
      }

      const deletedPageIds = collectChapterPageIds(audiobook, chapterIdToDelete);
      setAudiobooks(next);
      removePageState(deletedPageIds);
      setExpandedChapters(prev => {
        const updated = new Set(prev);
        updated.delete(chapterIdToDelete);
        return updated;
      });
      setRenameTarget(prev => {
        if (!prev || prev.audiobookId !== audiobookIdToDelete) {
          return prev;
        }
        if (prev.kind === 'audiobook') {
          return prev;
        }
        return prev.chapterId === chapterIdToDelete ? null : prev;
      });

      if (
        isSelectionAffectedByDelete(selection, {
          kind: 'chapter',
          audiobookId: audiobookIdToDelete,
          chapterId: chapterIdToDelete,
        })
      ) {
        const updatedAudiobook = next.find(item => item.id === audiobookIdToDelete);
        const fallbackChapter = updatedAudiobook?.chapters[0];
        const fallbackPage = fallbackChapter?.pages[0];
        if (fallbackChapter && fallbackPage) {
          navigate(
            buildEditorPath({
              audiobookId: audiobookIdToDelete,
              chapterId: fallbackChapter.id,
              pageId: fallbackPage.id,
            })
          );
        }
      }
    },
    [audiobooks, navigate, removePageState, selection]
  );

  const handleDeletePage = useCallback(
    (audiobookIdToDelete: string, chapterIdToDelete: string, pageIdToDelete: string) => {
      const audiobook = audiobooks.find(item => item.id === audiobookIdToDelete);
      const chapter = audiobook?.chapters.find(item => item.id === chapterIdToDelete);
      if (!audiobook || !chapter) {
        return;
      }

      const next = deletePage(
        audiobooks,
        audiobookIdToDelete,
        chapterIdToDelete,
        pageIdToDelete
      );
      if (!next) {
        return;
      }

      setAudiobooks(next);
      removePageState([pageIdToDelete]);
      setRenameTarget(prev => {
        if (!prev || prev.audiobookId !== audiobookIdToDelete) {
          return prev;
        }
        if (prev.kind === 'audiobook' || prev.kind === 'chapter') {
          return prev;
        }
        return prev.pageId === pageIdToDelete ? null : prev;
      });

      if (
        isSelectionAffectedByDelete(selection, {
          kind: 'page',
          audiobookId: audiobookIdToDelete,
          chapterId: chapterIdToDelete,
          pageId: pageIdToDelete,
        })
      ) {
        const updatedChapter = next
          .find(item => item.id === audiobookIdToDelete)
          ?.chapters.find(item => item.id === chapterIdToDelete);
        const fallbackPage = updatedChapter?.pages[0];
        if (fallbackPage) {
          navigate(
            buildEditorPath({
              audiobookId: audiobookIdToDelete,
              chapterId: chapterIdToDelete,
              pageId: fallbackPage.id,
            })
          );
        }
      }
    },
    [audiobooks, navigate, removePageState, selection]
  );

  const pageTitle = breadcrumb?.pageLabel ?? 'Chapter Page Editor';

  const defaultSelection = getDefaultSelection(audiobooks);

  if (!selection && !defaultSelection) {
    return (
      <div className="editor-page">
        <p className="editor-empty-state">No mock pages available.</p>
      </div>
    );
  }

  return (
    <div className={`editor-page${isResizing ? ' editor-page--resizing' : ''}`}>
      <aside className="editor-sidebar" style={{ width: sidebarWidth }}>
        <EditorContextPanel
          breadcrumb={breadcrumb}
          isDirty={currentPage ? dirtyPages.has(currentPage.id) : false}
        />
        <EditorDirectoryTree
          audiobooks={audiobooks}
          selection={selection}
          expandedAudiobooks={expandedAudiobooks}
          expandedChapters={expandedChapters}
          onToggleAudiobook={handleToggleAudiobook}
          onToggleChapter={handleToggleChapter}
          onSelectPage={handleSelectPage}
          onAddAudiobook={handleAddAudiobook}
          onAddChapter={handleAddChapter}
          onAddPage={handleAddPage}
          onDeleteAudiobook={handleDeleteAudiobook}
          onDeleteChapter={handleDeleteChapter}
          onDeletePage={handleDeletePage}
          onRenameAudiobook={handleRenameAudiobook}
          onRenameChapter={handleRenameChapter}
          onRenamePage={handleRenamePage}
          renameTarget={renameTarget}
          onRenameTargetHandled={() => setRenameTarget(null)}
        />
      </aside>

      <div
        className="editor-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor sidebar"
        onMouseDown={startResize}
      />

      <section className="editor-main">
        <EditorWorkspace
          content={editorContent}
          onChange={handleContentChange}
          pageTitle={pageTitle}
          pageId={currentPage?.id ?? null}
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      </section>
    </div>
  );
};

export default Editor;
