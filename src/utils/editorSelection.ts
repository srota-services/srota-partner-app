import type {
  EditorAudiobook,
  EditorBreadcrumb,
  EditorPage,
  EditorSelection,
} from '../types/editor';
import { getPageLabel } from './editorTreeMutations';

export function getDefaultSelection(
  audiobooks: EditorAudiobook[] = []
): EditorSelection | null {
  for (const audiobook of audiobooks) {
    for (const chapter of audiobook.chapters) {
      const page = chapter.pages[0];
      if (page) {
        return {
          audiobookId: audiobook.id,
          chapterId: chapter.id,
          pageId: page.id,
        };
      }
    }
  }

  return null;
}

export function findPageByIds(
  audiobooks: EditorAudiobook[],
  selection: EditorSelection
): {
  audiobook: EditorAudiobook;
  chapter: EditorAudiobook['chapters'][number];
  page: EditorPage;
} | null {
  const audiobook = audiobooks.find(item => item.id === selection.audiobookId);
  if (!audiobook) {
    return null;
  }

  const chapter = audiobook.chapters.find(item => item.id === selection.chapterId);
  if (!chapter) {
    return null;
  }

  const page = chapter.pages.find(item => item.id === selection.pageId);
  if (!page) {
    return null;
  }

  return { audiobook, chapter, page };
}

export function resolveSelectionFromParams(
  audiobooks: EditorAudiobook[],
  audiobookId?: string,
  chapterId?: string,
  pageId?: string
): EditorSelection | null {
  if (audiobookId && chapterId && pageId) {
    const match = findPageByIds(audiobooks, {
      audiobookId,
      chapterId,
      pageId,
    });

    if (match) {
      return { audiobookId, chapterId, pageId };
    }
  }

  if (audiobookId && chapterId) {
    const audiobook = audiobooks.find(item => item.id === audiobookId);
    const chapter = audiobook?.chapters.find(item => item.id === chapterId);
    const page = chapter?.pages[0];
    if (page) {
      return { audiobookId, chapterId, pageId: page.id };
    }
  }

  if (audiobookId) {
    const audiobook = audiobooks.find(item => item.id === audiobookId);
    for (const chapter of audiobook?.chapters ?? []) {
      const page = chapter.pages[0];
      if (page) {
        return {
          audiobookId,
          chapterId: chapter.id,
          pageId: page.id,
        };
      }
    }
  }

  return getDefaultSelection(audiobooks);
}

export function getEditorBreadcrumb(
  audiobooks: EditorAudiobook[],
  selection: EditorSelection
): EditorBreadcrumb | null {
  const match = findPageByIds(audiobooks, selection);
  if (!match) {
    return null;
  }

  return {
    audiobookTitle: match.audiobook.title,
    chapterTitle: match.chapter.title,
    chapterNumber: match.chapter.chapterNumber,
    pageNumber: match.page.pageNumber,
    pageLabel: getPageLabel(match.page),
    pageId: match.page.id,
  };
}

export function buildEditorPath(selection: EditorSelection): string {
  return `/editor/${selection.audiobookId}/${selection.chapterId}/${selection.pageId}`;
}

export function isSelectionAffectedByDelete(
  selection: EditorSelection | null,
  deleted: {
    kind: 'audiobook' | 'chapter' | 'page';
    audiobookId: string;
    chapterId?: string;
    pageId?: string;
  }
): boolean {
  if (!selection) {
    return false;
  }

  if (deleted.kind === 'audiobook') {
    return selection.audiobookId === deleted.audiobookId;
  }

  if (deleted.kind === 'chapter') {
    return (
      selection.audiobookId === deleted.audiobookId &&
      selection.chapterId === deleted.chapterId
    );
  }

  return (
    selection.audiobookId === deleted.audiobookId &&
    selection.chapterId === deleted.chapterId &&
    selection.pageId === deleted.pageId
  );
}

/** Parse deep-link IDs from an editor pathname (`/editor` or `/editor/a/c/p`). */
export function parseEditorPathParams(pathname: string): {
  audiobookId?: string;
  chapterId?: string;
  pageId?: string;
} {
  const match = pathname.match(/^\/editor(?:\/([^/]+)\/([^/]+)\/([^/]+))?\/?$/);
  if (!match?.[1] || !match[2] || !match[3]) {
    return {};
  }

  return {
    audiobookId: match[1],
    chapterId: match[2],
    pageId: match[3],
  };
}
