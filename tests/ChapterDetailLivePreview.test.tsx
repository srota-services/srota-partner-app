import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChapterDetailLivePreview from '../src/pages/chapters/components/ChapterDetailLivePreview';
import type { ChapterApiResponse } from '../src/types/audiobook';
import '../src/styles/components/wizard/WizardShell.css';
import '../src/styles/pages/audiobooks/components/AudiobookTable.css';
import '../src/styles/pages/chapters/components/ChapterCard.css';
import '../src/styles/pages/chapters/components/ChapterLivePreviewPanel.css';
import '../src/styles/pages/chapters/components/ChapterTranscodingStatus.css';

const baseChapter: ChapterApiResponse = {
  id: 'ch-1',
  title: 'Chapter One',
  description: 'A detailed chapter description',
  chapterNumber: 3,
  audiobookId: 'ab-1',
  duration: 125,
  minSubscriptionTier: 1,
  isActive: true,
};

describe('ChapterDetailLivePreview', () => {
  it('renders chapter details and a play button without wiring playback', () => {
    render(<ChapterDetailLivePreview chapter={baseChapter} />);

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Chapter 3')).toBeInTheDocument();
    expect(screen.getByText('Chapter One')).toBeInTheDocument();
    expect(screen.getByText('A detailed chapter description')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play chapter' })).toBeInTheDocument();
  });
});
