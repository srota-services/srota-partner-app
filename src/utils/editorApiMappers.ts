import type { JSONContent } from '@tiptap/react';
import type {
  AudiobookApiResponse,
  ChapterApiResponse,
  PageApiResponse,
} from '../types/audiobook';
import type { EditorAudiobook, EditorChapter, EditorPage } from '../types/editor';

/** Placeholder plain text for API page creates (backend rejects empty strings). */
export const MINIMAL_PLAIN_TEXT = '\u00a0';

export function emptyRichText(): JSONContent {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
}

function parseRichText(raw: unknown): JSONContent {
  if (raw && typeof raw === 'object') {
    return raw as JSONContent;
  }
  return emptyRichText();
}

export function mapAudiobookListItem(api: AudiobookApiResponse): EditorAudiobook {
  return {
    id: api.id,
    title: api.title,
    author: api.author,
    chapters: [],
  };
}

export function mapChapter(api: ChapterApiResponse): EditorChapter {
  return {
    id: api.id,
    chapterNumber: api.chapterNumber,
    title: api.title,
    pages: [],
  };
}

export function mapPage(api: PageApiResponse, label?: string): EditorPage {
  return {
    id: api.id,
    pageNumber: api.pageNumber,
    label: label ?? `Page ${api.pageNumber}`,
    plainText: api.plainText,
    richText: parseRichText(api.richText),
  };
}

export function mapAudiobookList(apiItems: AudiobookApiResponse[]): EditorAudiobook[] {
  return apiItems.map(mapAudiobookListItem);
}
