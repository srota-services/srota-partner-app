import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChapterReviewPublishStep from '../src/pages/chapters/components/wizard/steps/ChapterReviewPublishStep';
import type { ChapterWizardData } from '../src/types/audiobook';
import '../src/styles/components/wizard/WizardShell.css';

const baseData: ChapterWizardData = {
  title: 'Chapter One',
  description: 'Opening chapter description.',
  chapterNumber: 1,
  file: null,
  duration: 120,
  coverImage: null,
  isPaid: false,
  minSubscriptionTier: null,
};

describe('ChapterReviewPublishStep', () => {
  it('renders review rows with edit actions like the audiobook review step', async () => {
    const user = userEvent.setup();
    const onNavigateToStep = vi.fn();

    render(
      <ChapterReviewPublishStep
        data={{
          ...baseData,
          file: new File(['audio'], 'chapter.mp3', { type: 'audio/mpeg' }),
          coverImage: new File(['cover'], 'cover.jpg', { type: 'image/jpeg' }),
        }}
        onNavigateToStep={onNavigateToStep}
      />
    );

    expect(screen.getByText('Chapter One')).toBeInTheDocument();
    expect(screen.getByText('chapter.mp3')).toBeInTheDocument();
    expect(screen.getByText('cover.jpg')).toBeInTheDocument();
    expect(document.querySelector('.wizard-review-list')).toBeTruthy();
    expect(document.querySelector('.wizard-review-row')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /edit title/i }));
    expect(onNavigateToStep).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole('button', { name: /edit audio/i }));
    expect(onNavigateToStep).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('button', { name: /edit cover/i }));
    expect(onNavigateToStep).toHaveBeenCalledWith(3);
  });
});
