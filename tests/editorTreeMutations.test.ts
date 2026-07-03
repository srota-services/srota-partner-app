import { describe, expect, it } from 'vitest';
import {
  addAudiobook,
  addChapter,
  addPage,
  canDeleteAudiobook,
  canDeleteChapter,
  canDeletePage,
  createPage,
  deleteAudiobook,
  deleteChapter,
  deletePage,
  getPageLabel,
  renameAudiobook,
  renamePage,
} from '../src/utils/editorTreeMutations';
import { EDITOR_MOCK_AUDIOBOOKS } from '../src/utils/editorMockData';

describe('editorTreeMutations', () => {
  it('creates a page with the next page number', () => {
    const page = createPage([
      { id: 'pg-1', pageNumber: 1, plainText: '', richText: { type: 'doc', content: [] } },
    ]);

    expect(page.pageNumber).toBe(2);
    expect(getPageLabel(page)).toBe('Page 2');
  });

  it('adds an audiobook with a default chapter and page', () => {
    const next = addAudiobook(EDITOR_MOCK_AUDIOBOOKS);
    expect(next).toHaveLength(EDITOR_MOCK_AUDIOBOOKS.length + 1);
    expect(next[next.length - 1].chapters).toHaveLength(1);
    expect(next[next.length - 1].chapters[0].pages).toHaveLength(1);
  });

  it('adds a chapter to an existing audiobook', () => {
    const audiobookId = EDITOR_MOCK_AUDIOBOOKS[0].id;
    const next = addChapter(EDITOR_MOCK_AUDIOBOOKS, audiobookId);
    const audiobook = next.find(item => item.id === audiobookId);

    expect(audiobook?.chapters.length).toBe(
      EDITOR_MOCK_AUDIOBOOKS[0].chapters.length + 1
    );
  });

  it('adds a page to an existing chapter', () => {
    const audiobook = EDITOR_MOCK_AUDIOBOOKS[0];
    const chapter = audiobook.chapters[0];
    const next = addPage(EDITOR_MOCK_AUDIOBOOKS, audiobook.id, chapter.id);
    const updatedChapter = next
      .find(item => item.id === audiobook.id)
      ?.chapters.find(item => item.id === chapter.id);

    expect(updatedChapter?.pages.length).toBe(chapter.pages.length + 1);
  });

  it('renames audiobooks and pages', () => {
    const audiobookId = EDITOR_MOCK_AUDIOBOOKS[0].id;
    const chapterId = EDITOR_MOCK_AUDIOBOOKS[0].chapters[0].id;
    const pageId = EDITOR_MOCK_AUDIOBOOKS[0].chapters[0].pages[0].id;

    const renamedAudiobooks = renameAudiobook(
      EDITOR_MOCK_AUDIOBOOKS,
      audiobookId,
      'Renamed Epic'
    );
    const renamedPages = renamePage(
      renamedAudiobooks,
      audiobookId,
      chapterId,
      pageId,
      'Opening Page'
    );
    const page = renamedPages
      .find(item => item.id === audiobookId)
      ?.chapters.find(item => item.id === chapterId)
      ?.pages.find(item => item.id === pageId);

    expect(renamedAudiobooks[0].title).toBe('Renamed Epic');
    expect(page?.label).toBe('Opening Page');
    expect(getPageLabel(page!)).toBe('Opening Page');
  });

  it('deletes tree nodes while keeping at least one of each level', () => {
    const audiobook = EDITOR_MOCK_AUDIOBOOKS[0];
    const chapter = audiobook.chapters[0];
    const page = chapter.pages[0];

    expect(deleteAudiobook(EDITOR_MOCK_AUDIOBOOKS, audiobook.id)).not.toBeNull();
    expect(canDeleteAudiobook([audiobook])).toBe(false);
    expect(deleteAudiobook([audiobook], audiobook.id)).toBeNull();

    const withExtraChapter = addChapter(EDITOR_MOCK_AUDIOBOOKS, audiobook.id);
    const updatedAudiobook = withExtraChapter.find(item => item.id === audiobook.id)!;
    const extraChapter = updatedAudiobook.chapters.at(-1)!;

    expect(
      deleteChapter(withExtraChapter, audiobook.id, extraChapter.id)
    ).not.toBeNull();
    expect(canDeleteChapter(updatedAudiobook)).toBe(true);
    expect(deleteChapter(EDITOR_MOCK_AUDIOBOOKS, audiobook.id, chapter.id)).not.toBeNull();

    const singleChapterAudiobook = EDITOR_MOCK_AUDIOBOOKS[2];
    expect(
      deleteChapter(EDITOR_MOCK_AUDIOBOOKS, singleChapterAudiobook.id, singleChapterAudiobook.chapters[0].id)
    ).toBeNull();

    const withExtraPage = addPage(EDITOR_MOCK_AUDIOBOOKS, audiobook.id, chapter.id);
    const updatedChapter = withExtraPage
      .find(item => item.id === audiobook.id)!
      .chapters.find(item => item.id === chapter.id)!;
    const extraPage = updatedChapter.pages.at(-1)!;

    expect(
      deletePage(withExtraPage, audiobook.id, chapter.id, extraPage.id)
    ).not.toBeNull();
    expect(canDeletePage(updatedChapter)).toBe(true);
    expect(
      deletePage(EDITOR_MOCK_AUDIOBOOKS, audiobook.id, chapter.id, page.id)
    ).not.toBeNull();

    const singlePageChapter = singleChapterAudiobook.chapters[0];
    expect(
      deletePage(
        EDITOR_MOCK_AUDIOBOOKS,
        singleChapterAudiobook.id,
        singlePageChapter.id,
        singlePageChapter.pages[0].id
      )
    ).toBeNull();
  });
});
