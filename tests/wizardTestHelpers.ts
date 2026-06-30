import type { GenreItem, TagItem } from '../src/utils/audiobookApi';
import type { AudiobookApiResponse, ChapterApiResponse } from '../src/types/audiobook';

export const mockGenres: GenreItem[] = [
  {
    id: 'genre-1',
    name: 'Fiction',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const mockTags: TagItem[] = [
  {
    id: 'tag-1',
    name: 'Bestseller',
    type: 'general',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const mockAudiobook: AudiobookApiResponse = {
  id: 'ab-edit-1',
  title: 'Existing Audiobook',
  author: 'Existing Author',
  narrators: ['Narrator One'],
  description: 'Existing description for edit mode.',
  language: 'Hindi',
  coverImage: 'https://cdn.example.com/cover.jpg',
  genres: [{ name: 'Fiction' }],
  audiobookTags: [{ name: 'Bestseller', type: 'general' }],
  meta: { Producer: 'Studio X' },
  subscriptionGatingMode: 'AUDIOBOOK',
  isPublic: false,
  minSubscriptionTier: 2,
};

export const mockChapter: ChapterApiResponse = {
  id: 'ch-edit-1',
  title: 'Existing Chapter',
  description: 'Existing chapter description.',
  chapterNumber: 2,
  duration: 180,
  startPosition: 0,
  endPosition: 180,
  coverImage: 'https://cdn.example.com/chapter-cover.jpg',
  fileUrl: 'https://cdn.example.com/chapter-audio.mp3',
  audiobookId: 'ab-1',
  minSubscriptionTier: 2,
};

export const testCoverFile = new File(['cover'], 'cover.png', {
  type: 'image/png',
});

export const testAudioFile = new File(['audio'], 'chapter.mp3', {
  type: 'audio/mpeg',
});
