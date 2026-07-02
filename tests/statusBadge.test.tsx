import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { getChapterStatus } from '../src/pages/chapters/components/chapterTableStatus';
import { getStatus } from '../src/pages/audiobooks/components/audiobookTableStatus';
import AudiobookTable from '../src/pages/audiobooks/components/AudiobookTable';
import ChapterTableRow from '../src/pages/chapters/components/ChapterTableRow';
import transcodingReducer from '../src/store/slices/transcodingSlice';
import type { ChapterApiResponse, AudiobookApiResponse } from '../src/types/audiobook';
import '../src/styles/pages/audiobooks/components/AudiobookTable.css';
import '../src/styles/pages/chapters/components/ChapterTranscodingStatus.css';

const baseChapter: ChapterApiResponse = {
  id: 'ch-1',
  title: 'Chapter One',
  description: 'Description',
  chapterNumber: 1,
  audiobookId: 'ab-1',
};

const baseAudiobook: AudiobookApiResponse = {
  id: 'ab-1',
  title: 'Audiobook One',
  author: 'Author',
  description: 'Description',
};

function renderWithStore(ui: ReactElement) {
  const store = configureStore({
    reducer: { transcoding: transcodingReducer },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

function renderChapterRow(chapter: ChapterApiResponse) {
  return renderWithStore(
    <table>
      <tbody>
        <ChapterTableRow
          chapter={chapter}
          openMenuId={null}
          onMenuToggle={() => undefined}
          onMenuClose={() => undefined}
          onEdit={() => undefined}
          onDelete={() => undefined}
          onRefresh={() => undefined}
          refreshingChapterId={null}
        />
      </tbody>
    </table>
  );
}

describe('getChapterStatus', () => {
  it('returns live when scheduledAt is null and isActive is true', () => {
    expect(
      getChapterStatus({ ...baseChapter, isActive: true, scheduledAt: undefined })
    ).toEqual({
      label: 'Live',
      variant: 'live',
    });
  });

  it('returns pending when scheduledAt is null and isActive is false', () => {
    expect(
      getChapterStatus({
        ...baseChapter,
        isActive: false,
        scheduledAt: undefined,
      })
    ).toEqual({
      label: 'Pending',
      variant: 'pending',
    });
  });

  it('returns scheduled when scheduledAt is present and isActive is false', () => {
    expect(
      getChapterStatus({
        ...baseChapter,
        isActive: false,
        scheduledAt: '2026-05-08T12:00:00.000Z',
      })
    ).toEqual({
      label: 'Scheduled',
      variant: 'scheduled',
    });
  });

  it('returns upload failed when source upload failed', () => {
    expect(
      getChapterStatus({
        ...baseChapter,
        sourceUploadStatus: 'failed',
        isActive: false,
        scheduledAt: '2026-05-08T12:00:00.000Z',
      })
    ).toEqual({
      label: 'Upload failed',
      variant: 'upload-failed',
    });
  });
});

describe('getStatus', () => {
  it('returns live variant for active audiobooks', () => {
    expect(getStatus('live', { ...baseAudiobook, isActive: true })).toEqual({
      label: 'Live',
      variant: 'live',
    });
  });

  it('returns live variant on live filter even when isActive is false', () => {
    expect(getStatus('live', { ...baseAudiobook, isActive: false })).toEqual({
      label: 'Live',
      variant: 'live',
    });
  });

  it('returns live variant for active audiobooks on all tab', () => {
    expect(getStatus('all', { ...baseAudiobook, isActive: true })).toEqual({
      label: 'Live',
      variant: 'live',
    });
  });

  it('returns pending variant for inactive audiobooks on live/all tabs', () => {
    expect(getStatus('all', { ...baseAudiobook, isActive: false })).toEqual({
      label: 'Pending',
      variant: 'pending',
    });
  });

  it('returns scheduled variant on scheduled filter', () => {
    expect(getStatus('scheduled', baseAudiobook)).toEqual({
      label: 'Scheduled',
      variant: 'scheduled',
    });
  });

  it('returns draft variant on drafts filter', () => {
    expect(getStatus('drafts', baseAudiobook)).toEqual({
      label: 'Draft',
      variant: 'draft',
    });
  });
});

describe('status badge classes', () => {
  it('renders green live badge for chapter', () => {
    const { container } = renderChapterRow({ ...baseChapter, isActive: true });
    const badge = container.querySelector('.audiobook-status-badge--live');
    expect(badge).toBeTruthy();
    expect(badge).toHaveTextContent('Live');
  });

  it('renders yellow pending badge for chapter', () => {
    const { container } = renderChapterRow({
      ...baseChapter,
      isActive: false,
      scheduledAt: undefined,
    });
    const badge = container.querySelector('.audiobook-status-badge--pending');
    expect(badge).toBeTruthy();
    expect(badge).toHaveTextContent('Pending');
  });

  it('renders yellow scheduled badge for chapter', () => {
    const { container } = renderChapterRow({
      ...baseChapter,
      isActive: false,
      scheduledAt: '2026-05-08T12:00:00.000Z',
    });
    const badge = container.querySelector('.audiobook-status-badge--scheduled');
    expect(badge).toBeTruthy();
    expect(badge).toHaveTextContent('Scheduled');
  });

  it('renders red upload failed override for chapter', () => {
    const { container } = renderChapterRow({
      ...baseChapter,
      sourceUploadStatus: 'failed',
    });
    expect(
      container.querySelector('.chapter-status-badge--upload-failed')
    ).toBeTruthy();
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('renders green live badge for audiobook', () => {
    renderWithStore(
      <AudiobookTable
        audiobooks={[{ ...baseAudiobook, isActive: true }]}
        filter="live"
        onRowClick={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />
    );

    const badge = screen.getByText('Live', { selector: 'span.audiobook-status-badge' });
    expect(badge.classList.contains('audiobook-status-badge--live')).toBe(true);
  });
});
