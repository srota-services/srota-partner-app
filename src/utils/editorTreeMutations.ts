import type { JSONContent } from '@tiptap/react';
import type {
  EditorAudiobook,
  EditorChapter,
  EditorPage,
} from '../types/editor';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isLocalId(id: string): boolean {
  return id.startsWith('local-');
}

function emptyPageContent(): JSONContent {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
}

export function getPageLabel(page: EditorPage): string {
  return page.label ?? `Page ${page.pageNumber}`;
}

export function createAudiobook(existing: EditorAudiobook[]): EditorAudiobook {
  return {
    id: createId('local-ab'),
    title: `New Audiobook ${existing.length + 1}`,
    author: '',
    chapters: [],
  };
}

export function createChapter(existingChapters: EditorChapter[]): EditorChapter {
  const nextNumber = existingChapters.length + 1;

  return {
    id: createId('local-ch'),
    chapterNumber: nextNumber,
    title: `Chapter ${nextNumber}`,
    pages: [],
  };
}

export function createPage(existingPages: EditorPage[]): EditorPage {
  const nextNumber = existingPages.length + 1;

  return {
    id: createId('local-pg'),
    pageNumber: nextNumber,
    label: `Page ${nextNumber}`,
    plainText: '',
    richText: emptyPageContent(),
  };
}

export function renameAudiobook(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  title: string
): EditorAudiobook[] {
  const trimmed = title.trim();
  if (!trimmed) {
    return audiobooks;
  }

  return audiobooks.map(audiobook =>
    audiobook.id === audiobookId ? { ...audiobook, title: trimmed } : audiobook
  );
}

export function renameChapter(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapterId: string,
  title: string
): EditorAudiobook[] {
  const trimmed = title.trim();
  if (!trimmed) {
    return audiobooks;
  }

  return audiobooks.map(audiobook => {
    if (audiobook.id !== audiobookId) {
      return audiobook;
    }

    return {
      ...audiobook,
      chapters: audiobook.chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, title: trimmed } : chapter
      ),
    };
  });
}

export function renamePage(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapterId: string,
  pageId: string,
  label: string
): EditorAudiobook[] {
  const trimmed = label.trim();
  if (!trimmed) {
    return audiobooks;
  }

  return audiobooks.map(audiobook => {
    if (audiobook.id !== audiobookId) {
      return audiobook;
    }

    return {
      ...audiobook,
      chapters: audiobook.chapters.map(chapter => {
        if (chapter.id !== chapterId) {
          return chapter;
        }

        return {
          ...chapter,
          pages: chapter.pages.map(page =>
            page.id === pageId ? { ...page, label: trimmed } : page
          ),
        };
      }),
    };
  });
}

export function addAudiobook(audiobooks: EditorAudiobook[]): EditorAudiobook[] {
  return [...audiobooks, createAudiobook(audiobooks)];
}

export function addChapter(
  audiobooks: EditorAudiobook[],
  audiobookId: string
): EditorAudiobook[] {
  return audiobooks.map(audiobook => {
    if (audiobook.id !== audiobookId) {
      return audiobook;
    }

    const chapter = createChapter(audiobook.chapters);
    return {
      ...audiobook,
      chapters: [...audiobook.chapters, chapter],
    };
  });
}

export function addPage(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapterId: string
): EditorAudiobook[] {
  return audiobooks.map(audiobook => {
    if (audiobook.id !== audiobookId) {
      return audiobook;
    }

    return {
      ...audiobook,
      chapters: audiobook.chapters.map(chapter => {
        if (chapter.id !== chapterId) {
          return chapter;
        }

        const page = createPage(chapter.pages);
        return {
          ...chapter,
          pages: [...chapter.pages, page],
        };
      }),
    };
  });
}

export function canDeleteAudiobook(audiobooks: EditorAudiobook[]): boolean {
  return audiobooks.length > 1;
}

export function canDeleteChapter(audiobook: EditorAudiobook): boolean {
  return audiobook.chapters.length > 1;
}

export function canDeletePage(chapter: EditorChapter): boolean {
  return chapter.pages.length > 1;
}

export function deleteAudiobook(
  audiobooks: EditorAudiobook[],
  audiobookId: string
): EditorAudiobook[] | null {
  if (!canDeleteAudiobook(audiobooks)) {
    return null;
  }

  return audiobooks.filter(audiobook => audiobook.id !== audiobookId);
}

/** Removes a chapter without the "keep at least one" guard (e.g. discarding a failed local create). */
export function removeChapterById(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapterId: string
): EditorAudiobook[] {
  return audiobooks.map(audiobook => {
    if (audiobook.id !== audiobookId) {
      return audiobook;
    }

    return {
      ...audiobook,
      chapters: audiobook.chapters.filter(chapter => chapter.id !== chapterId),
    };
  });
}

export function deleteChapter(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapterId: string
): EditorAudiobook[] | null {
  const audiobook = audiobooks.find(item => item.id === audiobookId);
  if (!audiobook || !canDeleteChapter(audiobook)) {
    return null;
  }

  return audiobooks.map(item => {
    if (item.id !== audiobookId) {
      return item;
    }

    return {
      ...item,
      chapters: item.chapters.filter(chapter => chapter.id !== chapterId),
    };
  });
}

export function deletePage(
  audiobooks: EditorAudiobook[],
  audiobookId: string,
  chapterId: string,
  pageId: string
): EditorAudiobook[] | null {
  const audiobook = audiobooks.find(item => item.id === audiobookId);
  const chapter = audiobook?.chapters.find(item => item.id === chapterId);
  if (!chapter || !canDeletePage(chapter)) {
    return null;
  }

  return audiobooks.map(item => {
    if (item.id !== audiobookId) {
      return item;
    }

    return {
      ...item,
      chapters: item.chapters.map(chapterItem => {
        if (chapterItem.id !== chapterId) {
          return chapterItem;
        }

        return {
          ...chapterItem,
          pages: chapterItem.pages.filter(page => page.id !== pageId),
        };
      }),
    };
  });
}

export function collectPageIds(audiobooks: EditorAudiobook[]): string[] {
  return audiobooks.flatMap(audiobook =>
    audiobook.chapters.flatMap(chapter => chapter.pages.map(page => page.id))
  );
}

export function collectChapterPageIds(
  audiobook: EditorAudiobook,
  chapterId: string
): string[] {
  const chapter = audiobook.chapters.find(item => item.id === chapterId);
  return chapter?.pages.map(page => page.id) ?? [];
}

export function collectAudiobookPageIds(audiobook: EditorAudiobook): string[] {
  return audiobook.chapters.flatMap(chapter => chapter.pages.map(page => page.id));
}
