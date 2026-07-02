import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChapterTable from '../src/pages/chapters/components/ChapterTable';
import type { ChapterApiResponse } from '../src/types/audiobook';
import transcodingReducer from '../src/store/slices/transcodingSlice';
import '../src/styles/pages/audiobooks/components/AudiobookTable.css';
import '../src/styles/pages/chapters/components/ChapterTable.css';
import '../src/styles/pages/chapters/components/ChapterTranscodingStatus.css';

const baseChapter: ChapterApiResponse = {
  id: 'ch-1',
  title: 'Chapter One',
  description: 'Description',
  chapterNumber: 1,
  audiobookId: 'ab-1',
};

function renderWithStore(ui: ReactElement) {
  const store = configureStore({
    reducer: { transcoding: transcodingReducer },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe('ChapterTable subscription column', () => {
  it('shows Free when minSubscriptionTier is 0 or unset', () => {
    renderWithStore(
      <ChapterTable
        chapters={[
          { ...baseChapter, minSubscriptionTier: 0 },
          { ...baseChapter, id: 'ch-2', title: 'Chapter Two', minSubscriptionTier: null },
        ]}
        statusByChapter={{}}
        selectedChapterId={null}
        onRowSelect={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
        onRefresh={() => undefined}
        refreshingChapterId={null}
      />
    );

    expect(screen.getAllByText('Free')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: 'Subscription' })).toBeInTheDocument();
  });

  it('shows tier labels for paid chapters', () => {
    renderWithStore(
      <ChapterTable
        chapters={[
          { ...baseChapter, minSubscriptionTier: 1 },
          { ...baseChapter, id: 'ch-2', title: 'Chapter Two', minSubscriptionTier: 3 },
        ]}
        statusByChapter={{}}
        selectedChapterId={null}
        onRowSelect={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
        onRefresh={() => undefined}
        refreshingChapterId={null}
      />
    );

    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('calls onRefresh with chapter id when refresh icon is clicked', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    renderWithStore(
      <ChapterTable
        chapters={[baseChapter]}
        statusByChapter={{}}
        selectedChapterId={null}
        onRowSelect={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
        onRefresh={onRefresh}
        refreshingChapterId={null}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Refresh chapter' }));

    expect(onRefresh).toHaveBeenCalledWith('ch-1');
  });

  it('calls onRowSelect when a chapter row is clicked', async () => {
    const user = userEvent.setup();
    const onRowSelect = vi.fn();

    renderWithStore(
      <ChapterTable
        chapters={[baseChapter]}
        statusByChapter={{}}
        selectedChapterId={null}
        onRowSelect={onRowSelect}
        onEdit={() => undefined}
        onDelete={() => undefined}
        onRefresh={() => undefined}
        refreshingChapterId={null}
      />
    );

    await user.click(screen.getByText('Chapter One'));

    expect(onRowSelect).toHaveBeenCalledWith(baseChapter);
  });
});
