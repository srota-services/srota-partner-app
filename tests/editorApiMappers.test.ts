import { describe, expect, it } from 'vitest';
import {
  emptyRichText,
  mapAudiobookListItem,
  mapChapter,
  mapPage,
  MINIMAL_PLAIN_TEXT,
} from '../src/utils/editorApiMappers';

describe('editorApiMappers', () => {
  it('maps audiobook list items with empty chapters', () => {
    const mapped = mapAudiobookListItem({
      id: 'ab-1',
      title: 'Draft Book',
      author: 'Author',
      description: '',
    });

    expect(mapped).toEqual({
      id: 'ab-1',
      title: 'Draft Book',
      author: 'Author',
      chapters: [],
    });
  });

  it('maps chapters with empty pages', () => {
    const mapped = mapChapter({
      id: 'ch-1',
      audiobookId: 'ab-1',
      title: 'Chapter 1',
      description: '',
      chapterNumber: 1,
    });

    expect(mapped.pages).toEqual([]);
    expect(mapped.title).toBe('Chapter 1');
  });

  it('maps pages with rich text and default label', () => {
    const richText = emptyRichText();
    const mapped = mapPage({
      id: 'pg-1',
      chapterId: 'ch-1',
      pageNumber: 2,
      plainText: MINIMAL_PLAIN_TEXT,
      richText,
    });

    expect(mapped.label).toBe('Page 2');
    expect(mapped.richText).toEqual(richText);
  });
});
