import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Editor as TiptapEditorInstance } from '@tiptap/react';
import type { JSONContent } from '@tiptap/react';
import type {
  EditorAudiobook,
  EditorNote,
  EditorSelection,
  EditorTreeRenameTarget,
} from '../../types/editor';
import { useResizablePanel } from '../../hooks/useResizablePanel';
import { useEditorAutoSave } from '../../hooks/useEditorAutoSave';
import { useAppSelector } from '../../hooks/redux';
import {
  createAudiobook as createAudiobookApi,
  createAuthoringChapter,
  createPage as createPageApi,
  deleteAudiobook as deleteAudiobookApi,
  deleteChapter as deleteChapterApi,
  deletePage as deletePageApi,
  getAudiobooks,
  getChapters,
  getPagesByChapterId,
  updateAudiobook as updateAudiobookApi,
  updateChapter as updateChapterApi,
  updatePage as updatePageApi,
} from '../../utils/audiobookApi';
import {
  emptyRichText,
  mapAudiobookList,
  mapChapter,
  mapPage,
  MINIMAL_PLAIN_TEXT,
} from '../../utils/editorApiMappers';
import {
  addAudiobook,
  addChapter,
  collectAudiobookPageIds,
  collectChapterPageIds,
  deleteAudiobook,
  deleteChapter,
  deletePage,
  isLocalId,
  removeChapterById,
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
import { resolveAudiobookFetchOwnerId } from '../../utils/resolveAudiobookFetchOwnerId';
import { resolveAudiobookOwner } from '../../utils/resolveAudiobookOwner';
import { getMyAuthorProfile } from '../../utils/partnerApi';
import { showError } from '../../utils/toast';
import { extractNotesFromRichText } from '../../utils/editorNotes';
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

function mergeChaptersIntoAudiobook(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapters: EditorAudiobook['chapters']
): EditorAudiobook[] {
  return audiobooks.map(audiobook =>
    audiobook.id === audiobookId ? { ...audiobook, chapters } : audiobook
  );
}

function mergePagesIntoChapter(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapterId: string,
  pages: EditorAudiobook['chapters'][number]['pages']
): EditorAudiobook[] {
  return audiobooks.map(audiobook => {
    if (audiobook.id !== audiobookId) {
      return audiobook;
    }

    return {
      ...audiobook,
      chapters: audiobook.chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, pages } : chapter
      ),
    };
  });
}

function replaceAudiobookId(
  audiobooks: EditorAudiobook[],
  localId: string,
  serverAudiobook: EditorAudiobook
): EditorAudiobook[] {
  return audiobooks.map(audiobook =>
    audiobook.id === localId
      ? { ...serverAudiobook, chapters: audiobook.chapters }
      : audiobook
  );
}

function replaceChapterId(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  localChapterId: string,
  serverChapter: EditorAudiobook['chapters'][number]
): EditorAudiobook[] {
  return audiobooks.map(audiobook => {
    if (audiobook.id !== audiobookId) {
      return audiobook;
    }

    return {
      ...audiobook,
      chapters: audiobook.chapters.map(chapter =>
        chapter.id === localChapterId ? serverChapter : chapter
      ),
    };
  });
}

function getAuthorDisplayNameFromProfile(profile: {
  firstName?: string | null;
  lastName?: string | null;
  slug?: string;
}): string {
  const parts = [profile.firstName, profile.lastName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }
  return profile.slug ?? 'Author';
}

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { audiobookId, chapterId, pageId } = parseEditorPathParams(location.pathname);
  const { appType, role } = useAppSelector(state => state.auth);

  const [audiobooks, setAudiobooks] = useState<EditorAudiobook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedChaptersFor, setLoadedChaptersFor] = useState<Set<string>>(
    () => new Set()
  );
  const [loadedPagesFor, setLoadedPagesFor] = useState<Set<string>>(
    () => new Set()
  );
  const [pageDrafts, setPageDrafts] = useState<Record<string, JSONContent>>({});
  const [dirtyPages, setDirtyPages] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<EditorNote[]>([]);
  const [renameTarget, setRenameTarget] = useState<EditorTreeRenameTarget | null>(
    null
  );
  const editorRef = useRef<TiptapEditorInstance | null>(null);
  const audiobooksRef = useRef(audiobooks);

  useEffect(() => {
    audiobooksRef.current = audiobooks;
  }, [audiobooks]);

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

  useEffect(() => {
    let cancelled = false;

    async function loadAudiobooks() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const ownerId = await resolveAudiobookFetchOwnerId(appType);
        const response = await getAudiobooks(
          1,
          undefined,
          undefined,
          ownerId ?? undefined,
          'AUTHORING'
        );

        if (!cancelled) {
          setAudiobooks(mapAudiobookList(response.data));
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof error.message === 'string'
              ? error.message
              : 'Failed to load audiobooks';
          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAudiobooks();

    return () => {
      cancelled = true;
    };
  }, [appType]);

  const ensureChaptersLoaded = useCallback(async (audiobookIdToLoad: string) => {
    if (isLocalId(audiobookIdToLoad) || loadedChaptersFor.has(audiobookIdToLoad)) {
      return;
    }

    const response = await getChapters(audiobookIdToLoad);
    const chapters = response.data.map(mapChapter);

    setAudiobooks(prev =>
      mergeChaptersIntoAudiobook(prev, audiobookIdToLoad, chapters)
    );
    setLoadedChaptersFor(prev => new Set(prev).add(audiobookIdToLoad));
  }, [loadedChaptersFor]);

  const ensurePagesLoaded = useCallback(
    async (audiobookIdToLoad: string, chapterIdToLoad: string) => {
      if (isLocalId(chapterIdToLoad) || loadedPagesFor.has(chapterIdToLoad)) {
        return;
      }

      const response = await getPagesByChapterId(chapterIdToLoad);
      const pages = response.data.map(page => mapPage(page));

      setAudiobooks(prev =>
        mergePagesIntoChapter(prev, audiobookIdToLoad, chapterIdToLoad, pages)
      );
      setLoadedPagesFor(prev => new Set(prev).add(chapterIdToLoad));
    },
    [loadedPagesFor]
  );

  useEffect(() => {
    if (!selectionAudiobookId || isLocalId(selectionAudiobookId)) {
      return;
    }

    void ensureChaptersLoaded(selectionAudiobookId);
  }, [selectionAudiobookId, ensureChaptersLoaded]);

  useEffect(() => {
    if (
      !selectionAudiobookId ||
      !selectionChapterId ||
      isLocalId(selectionChapterId)
    ) {
      return;
    }

    void ensurePagesLoaded(selectionAudiobookId, selectionChapterId);
  }, [selectionAudiobookId, selectionChapterId, ensurePagesLoaded]);

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

  useEffect(() => {
    if (!currentPage) {
      return;
    }

    const richText = pageDrafts[currentPage.id] ?? currentPage.richText;
    const pageNotes = extractNotesFromRichText(richText, currentPage.id);

    setNotes(prev => [
      ...prev.filter(note => note.pageId !== currentPage.id),
      ...pageNotes,
    ]);
  }, [currentPage?.id, currentPage?.richText]);

  const getPageContentForSave = useCallback(() => {
    if (!currentPage || !editorRef.current) {
      return null;
    }

    const richText = pageDrafts[currentPage.id] ?? editorRef.current.getJSON();
    return {
      plainText: editorRef.current.getText(),
      richText,
    };
  }, [currentPage, pageDrafts]);

  const handlePageSaved = useCallback((savedPageId: string) => {
    setDirtyPages(prev => {
      const next = new Set(prev);
      next.delete(savedPageId);
      return next;
    });
  }, []);

  const { markEdited, isSaving: isAutoSaving } = useEditorAutoSave({
    pageId: currentPage?.id ?? null,
    chapterId: selectionChapterId ?? null,
    pageNumber: currentPage?.pageNumber ?? null,
    isDirty: currentPage ? dirtyPages.has(currentPage.id) : false,
    isLocalPage: currentPage ? isLocalId(currentPage.id) : true,
    getContent: getPageContentForSave,
    onSaved: handlePageSaved,
    onEdit: () => {},
  });

  const [isManualSaving, setIsManualSaving] = useState(false);

  const isSavingPage = isAutoSaving || isManualSaving;

  const saveCurrentPage = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!currentPage || !selectionChapterId || isLocalId(currentPage.id)) {
        return false;
      }

      if (!force && !dirtyPages.has(currentPage.id)) {
        return false;
      }

      const content = getPageContentForSave();
      if (!content) {
        return false;
      }

      setIsManualSaving(true);
      try {
        await updatePageApi(currentPage.id, {
          chapterId: selectionChapterId,
          pageNumber: currentPage.pageNumber,
          plainText: content.plainText,
          richText: content.richText,
        });
        handlePageSaved(currentPage.id);
        return true;
      } catch (error) {
        console.error('Failed to save page:', error);
        showError('Failed to save page');
        return false;
      } finally {
        setIsManualSaving(false);
      }
    },
    [
      currentPage,
      selectionChapterId,
      dirtyPages,
      getPageContentForSave,
      handlePageSaved,
    ]
  );

  const saveCurrentPageIfDirty = useCallback(async () => {
    await saveCurrentPage({ force: false });
  }, [saveCurrentPage]);

  const handleManualSave = useCallback(() => {
    void saveCurrentPage({ force: true });
  }, [saveCurrentPage]);

  const canSavePage = Boolean(
    currentPage &&
      selectionChapterId &&
      !isLocalId(currentPage.id) &&
      dirtyPages.has(currentPage.id) &&
      !isSavingPage
  );

  const handleSelectPage = useCallback(
    (nextSelection: EditorSelection) => {
      void saveCurrentPageIfDirty();
      setExpandedAudiobooks(prev => new Set(prev).add(nextSelection.audiobookId));
      setExpandedChapters(prev => new Set(prev).add(nextSelection.chapterId));
      void ensureChaptersLoaded(nextSelection.audiobookId);
      void ensurePagesLoaded(nextSelection.audiobookId, nextSelection.chapterId);
      navigate(buildEditorPath(nextSelection));
    },
    [navigate, saveCurrentPageIfDirty, ensureChaptersLoaded, ensurePagesLoaded]
  );

  const handleToggleAudiobook = useCallback(
    (audiobookIdToToggle: string) => {
      setExpandedAudiobooks(prev => {
        const next = new Set(prev);
        const willExpand = !next.has(audiobookIdToToggle);
        if (willExpand) {
          next.add(audiobookIdToToggle);
          void ensureChaptersLoaded(audiobookIdToToggle);
        } else {
          next.delete(audiobookIdToToggle);
        }
        return next;
      });
    },
    [ensureChaptersLoaded]
  );

  const handleToggleChapter = useCallback(
    (audiobookIdToToggle: string, chapterIdToToggle: string) => {
      setExpandedChapters(prev => {
        const next = new Set(prev);
        const willExpand = !next.has(chapterIdToToggle);
        if (willExpand) {
          next.add(chapterIdToToggle);
          void ensurePagesLoaded(audiobookIdToToggle, chapterIdToToggle);
        } else {
          next.delete(chapterIdToToggle);
        }
        return next;
      });
    },
    [ensurePagesLoaded]
  );

  const handleContentChange = useCallback(
    (content: JSONContent) => {
      if (!currentPage) {
        return;
      }

      markEdited();
      setPageDrafts(prev => ({
        ...prev,
        [currentPage.id]: content,
      }));
      setDirtyPages(prev => new Set(prev).add(currentPage.id));
    },
    [currentPage, markEdited]
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

    if (!created) {
      return;
    }

    setAudiobooks(next);
    setExpandedAudiobooks(prev => new Set(prev).add(created.id));
    setRenameTarget({ kind: 'audiobook', audiobookId: created.id });
  }, [audiobooks]);

  const handleAddChapter = useCallback(
    (audiobookIdToUpdate: string) => {
      if (isLocalId(audiobookIdToUpdate)) {
        showError('Save the audiobook before adding chapters.');
        return;
      }

      const next = addChapter(audiobooks, audiobookIdToUpdate);
      const audiobook = next.find(item => item.id === audiobookIdToUpdate);
      const chapter = audiobook?.chapters[audiobook.chapters.length - 1];

      if (!chapter) {
        return;
      }

      setAudiobooks(next);
      setExpandedAudiobooks(prev => new Set(prev).add(audiobookIdToUpdate));
      setExpandedChapters(prev => new Set(prev).add(chapter.id));
      setRenameTarget({
        kind: 'chapter',
        audiobookId: audiobookIdToUpdate,
        chapterId: chapter.id,
      });
    },
    [audiobooks]
  );

  const handleAddPage = useCallback(
    async (audiobookIdToUpdate: string, chapterIdToUpdate: string) => {
      if (isLocalId(audiobookIdToUpdate) || isLocalId(chapterIdToUpdate)) {
        return;
      }

      const audiobook = audiobooks.find(item => item.id === audiobookIdToUpdate);
      const chapter = audiobook?.chapters.find(item => item.id === chapterIdToUpdate);
      if (!chapter) {
        return;
      }

      const pageNumber = chapter.pages.length + 1;

      try {
        const created = await createPageApi(chapterIdToUpdate, {
          chapterId: chapterIdToUpdate,
          pageNumber,
          plainText: MINIMAL_PLAIN_TEXT,
          richText: emptyRichText(),
        });

        const serverPage = mapPage(created);
        const nextPages = [...chapter.pages, serverPage];

        setAudiobooks(prev =>
          mergePagesIntoChapter(
            prev,
            audiobookIdToUpdate,
            chapterIdToUpdate,
            nextPages
          )
        );

        const nextSelection: EditorSelection = {
          audiobookId: audiobookIdToUpdate,
          chapterId: chapterIdToUpdate,
          pageId: serverPage.id,
        };

        setExpandedAudiobooks(prev => new Set(prev).add(audiobookIdToUpdate));
        setExpandedChapters(prev => new Set(prev).add(chapterIdToUpdate));
        navigate(buildEditorPath(nextSelection));
      } catch (error) {
        console.error('Failed to create Page. Try again later.:', error);
        showError('Failed to create Page. Try again later.');
      }
    },
    [audiobooks, navigate]
  );

  const handleRenameAudiobook = useCallback(
    async (audiobookIdToRename: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) {
        return;
      }

      setAudiobooks(prev => renameAudiobook(prev, audiobookIdToRename, trimmed));

      try {
        if (isLocalId(audiobookIdToRename)) {
          const owner = await resolveAudiobookOwner(role, appType);
          if (!owner) {
            throw new Error('Unable to resolve audiobook owner');
          }

          const profile = await getMyAuthorProfile();
          const created = await createAudiobookApi({
            type: 'AUTHORING',
            title: trimmed,
            author: getAuthorDisplayNameFromProfile(profile),
            description: '',
            owner,
            genreIds: [],
            tagIds: [],
            duration: 0,
            fileSize: 0,
          });

          const [mapped] = mapAudiobookList([created]);
          if (!mapped) {
            return;
          }
          setAudiobooks(prev => replaceAudiobookId(prev, audiobookIdToRename, mapped));

          if (selection?.audiobookId === audiobookIdToRename && selection.chapterId && selection.pageId) {
            navigate(
              buildEditorPath({
                audiobookId: created.id,
                chapterId: selection.chapterId,
                pageId: selection.pageId,
              })
            );
          }
        } else {
          await updateAudiobookApi({
            audiobookId: audiobookIdToRename,
            title: trimmed,
            type: 'AUTHORING',
          });
        }
      } catch (error) {
        console.error('Failed to save audiobook:', error);
        if (isLocalId(audiobookIdToRename)) {
          showError('Failed to create Audiobook. Try again later.');
        }
      }
    },
    [appType, navigate, role, selection]
  );

  const handleRenameChapter = useCallback(
    async (
      audiobookIdToRename: string,
      chapterIdToRename: string,
      title: string
    ) => {
      const trimmed = title.trim();
      if (!trimmed) {
        if (isLocalId(chapterIdToRename)) {
          setAudiobooks(prev =>
            removeChapterById(prev, audiobookIdToRename, chapterIdToRename)
          );
          setExpandedChapters(prev => {
            const next = new Set(prev);
            next.delete(chapterIdToRename);
            return next;
          });
        }
        return;
      }

      const audiobook = audiobooksRef.current.find(
        item => item.id === audiobookIdToRename
      );
      const chapter = audiobook?.chapters.find(item => item.id === chapterIdToRename);
      if (!chapter) {
        return;
      }

      const isLocalChapter = isLocalId(chapterIdToRename);
      const previousTitle = chapter.title;

      if (!isLocalChapter) {
        setAudiobooks(prev =>
          renameChapter(prev, audiobookIdToRename, chapterIdToRename, trimmed)
        );
      }

      try {
        if (isLocalChapter) {
          const created = await createAuthoringChapter({
            audiobookId: audiobookIdToRename,
            title: trimmed,
            description: '',
            chapterNumber: chapter.chapterNumber,
            pages: [
              {
                pageNumber: 1,
                plainText: MINIMAL_PLAIN_TEXT,
                richText: emptyRichText(),
              },
            ],
          });

          const pagesResponse = await getPagesByChapterId(created.id);
          const pages = pagesResponse.data.map(page => mapPage(page));
          const serverChapter = { ...mapChapter(created), pages };

          setAudiobooks(prev =>
            replaceChapterId(
              prev,
              audiobookIdToRename,
              chapterIdToRename,
              serverChapter
            )
          );
          setLoadedChaptersFor(prev => new Set(prev).add(audiobookIdToRename));
          setLoadedPagesFor(prev => new Set(prev).add(created.id));

          const firstPage = pages[0];
          if (firstPage) {
            navigate(
              buildEditorPath({
                audiobookId: audiobookIdToRename,
                chapterId: created.id,
                pageId: firstPage.id,
              })
            );
          }
        } else {
          await updateChapterApi({
            chapterId: chapterIdToRename,
            title: trimmed,
          });
        }
      } catch (error) {
        console.error('Failed to save chapter:', error);

        if (isLocalChapter) {
          showError('Failed to create Chapter. Try again later.');
          setAudiobooks(prev =>
            removeChapterById(prev, audiobookIdToRename, chapterIdToRename)
          );
          setExpandedChapters(prev => {
            const next = new Set(prev);
            next.delete(chapterIdToRename);
            return next;
          });
          setRenameTarget(prev =>
            prev?.kind === 'chapter' && prev.chapterId === chapterIdToRename
              ? null
              : prev
          );
        } else {
          setAudiobooks(prev =>
            renameChapter(prev, audiobookIdToRename, chapterIdToRename, previousTitle)
          );
        }
      }
    },
    [navigate]
  );

  const handleRenamePage = useCallback(
    (
      audiobookIdToRename: string,
      chapterIdToRename: string,
      pageIdToRename: string,
      label: string
    ) => {
      const trimmed = label.trim();
      if (!trimmed) {
        return;
      }

      setAudiobooks(prev =>
        renamePage(prev, audiobookIdToRename, chapterIdToRename, pageIdToRename, trimmed)
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
      pageIds.forEach(id => {
        delete next[id];
      });
      return next;
    });
    setDirtyPages(prev => {
      const next = new Set(prev);
      pageIds.forEach(id => next.delete(id));
      return next;
    });
    setNotes(prev => prev.filter(note => !pageIdSet.has(note.pageId)));
  }, []);

  const handleDeleteAudiobook = useCallback(
    async (audiobookIdToDelete: string) => {
      const audiobook = audiobooks.find(item => item.id === audiobookIdToDelete);
      if (!audiobook) {
        return;
      }

      const next = deleteAudiobook(audiobooks, audiobookIdToDelete);
      if (!next) {
        return;
      }

      try {
        if (!isLocalId(audiobookIdToDelete)) {
          await deleteAudiobookApi(audiobookIdToDelete);
        }
      } catch (error) {
        console.error('Failed to delete audiobook:', error);
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

      if (
        isSelectionAffectedByDelete(selection, {
          kind: 'audiobook',
          audiobookId: audiobookIdToDelete,
        })
      ) {
        const fallback = getDefaultSelection(next);
        if (fallback) {
          navigate(buildEditorPath(fallback));
        } else {
          navigate('/editor');
        }
      }
    },
    [audiobooks, navigate, removePageState, selection]
  );

  const handleDeleteChapter = useCallback(
    async (audiobookIdToDelete: string, chapterIdToDelete: string) => {
      const audiobook = audiobooks.find(item => item.id === audiobookIdToDelete);
      if (!audiobook) {
        return;
      }

      const next = deleteChapter(audiobooks, audiobookIdToDelete, chapterIdToDelete);
      if (!next) {
        return;
      }

      try {
        if (!isLocalId(chapterIdToDelete)) {
          await deleteChapterApi(chapterIdToDelete);
        }
      } catch (error) {
        console.error('Failed to delete chapter:', error);
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
        } else {
          navigate('/editor');
        }
      }
    },
    [audiobooks, navigate, removePageState, selection]
  );

  const handleDeletePage = useCallback(
    async (
      audiobookIdToDelete: string,
      chapterIdToDelete: string,
      pageIdToDelete: string
    ) => {
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

      try {
        if (!isLocalId(pageIdToDelete)) {
          await deletePageApi(pageIdToDelete);
        }
      } catch (error) {
        console.error('Failed to delete page:', error);
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
        } else {
          navigate('/editor');
        }
      }
    },
    [audiobooks, navigate, removePageState, selection]
  );

  const pageTitle = breadcrumb?.pageLabel ?? 'Chapter Page Editor';

  return (
    <div className={`editor-page${isResizing ? ' editor-page--resizing' : ''}`}>
      <aside className="editor-sidebar" style={{ width: sidebarWidth }}>
        <EditorContextPanel
          breadcrumb={breadcrumb}
          isDirty={currentPage ? dirtyPages.has(currentPage.id) : false}
          isSaving={isSavingPage}
        />
        {isLoading && (
          <p className="editor-empty-state">Loading audiobooks...</p>
        )}
        {loadError && !isLoading && (
          <p className="editor-empty-state" role="alert">
            {loadError}
          </p>
        )}
        {!isLoading && !loadError && (
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
        )}
      </aside>

      <div
        className="editor-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor sidebar"
        onMouseDown={startResize}
      />

      <section className="editor-main">
        {currentPage && selection ? (
          <EditorWorkspace
            content={editorContent}
            onChange={handleContentChange}
            pageTitle={pageTitle}
            pageId={currentPage.id}
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onEditorInstanceChange={editor => {
              editorRef.current = editor;
            }}
            onSave={handleManualSave}
            canSave={canSavePage}
            isSaving={isSavingPage}
          />
        ) : (
          <div className="editor-workspace editor-workspace--empty">
            <p className="editor-empty-state">
              Select or create a chapter and page to start writing.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Editor;
