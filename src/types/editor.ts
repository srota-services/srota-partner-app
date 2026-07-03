import type { JSONContent } from '@tiptap/react';

export interface EditorPage {
  id: string;
  pageNumber: number;
  /** Display label in the directory tree. Defaults to "Page N". */
  label?: string;
  plainText: string;
  richText: JSONContent;
}

export interface EditorChapter {
  id: string;
  chapterNumber: number;
  title: string;
  pages: EditorPage[];
}

export interface EditorAudiobook {
  id: string;
  title: string;
  author: string;
  chapters: EditorChapter[];
}

export interface EditorSelection {
  audiobookId: string;
  chapterId: string;
  pageId: string;
}

export interface EditorBreadcrumb {
  audiobookTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  pageNumber: number;
  pageLabel: string;
  pageId: string;
}

export interface EditorNote {
  id: string;
  pageId: string;
  quotedText: string;
  noteText: string;
  createdAt: string;
}

export type EditorTreeRenameTarget =
  | { kind: 'audiobook'; audiobookId: string }
  | { kind: 'chapter'; audiobookId: string; chapterId: string }
  | { kind: 'page'; audiobookId: string; chapterId: string; pageId: string };
