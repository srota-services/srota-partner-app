import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { store } from '../src/store/store';
import ChapterWizard from '../src/pages/chapters/ChapterWizard';
import { mockChapter, testAudioFile, testCoverFile } from './wizardTestHelpers';

const { createChapterMock, updateChapterMock } = vi.hoisted(() => ({
  createChapterMock: vi.fn(),
  updateChapterMock: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../src/utils/audiobookApi', async importOriginal => {
  const actual =
    await importOriginal<typeof import('../src/utils/audiobookApi')>();
  return {
    ...actual,
    createChapter: createChapterMock,
    updateChapter: updateChapterMock,
    getSubscriptionPlans: vi.fn().mockResolvedValue([
      { name: 'Base Plan' },
      { name: 'Standard Plan' },
      { name: 'Premium Plan' },
    ]),
    getChapters: vi.fn().mockResolvedValue({
      success: true,
      data: [],
      message: 'ok',
      statusCode: 200,
      timestamp: '2024-01-01T00:00:00.000Z',
      path: '/chapters',
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      },
    }),
  };
});

async function fillBasicsStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^title/i), 'Chapter One');
  await user.type(
    screen.getByLabelText(/^description/i),
    'Opening chapter description.'
  );
}

async function advanceToAudioStep(user: ReturnType<typeof userEvent.setup>) {
  await fillBasicsStep(user);
  await user.click(screen.getByRole('button', { name: /continue/i }));
  return screen.findByLabelText(/audio file/i);
}

async function uploadAudioFile(user: ReturnType<typeof userEvent.setup>) {
  const audioInput = await advanceToAudioStep(user);
  await user.upload(audioInput, testAudioFile);
  await screen.findByText(/chapter\.mp3/i);
}

async function advanceToCoverStep(user: ReturnType<typeof userEvent.setup>) {
  await uploadAudioFile(user);
  await user.click(screen.getByRole('button', { name: /continue/i }));
}

async function advanceToReviewStep(user: ReturnType<typeof userEvent.setup>) {
  await advanceToCoverStep(user);
  const coverInputs = document.querySelectorAll('input[type="file"]');
  const coverInput = coverInputs[coverInputs.length - 1] as HTMLInputElement;
  await user.upload(coverInput, testCoverFile);
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByRole('button', { name: /^publish$/i });
}

function mockAudioMetadata() {
  class MockAudio {
    duration = 120;

    addEventListener(event: string, callback: () => void) {
      if (event === 'loadedmetadata') {
        callback();
      }
    }

    removeEventListener() {
      return undefined;
    }
  }

  vi.stubGlobal('Audio', MockAudio);
}

function renderCreateWizard() {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/audiobooks/ab-1/chapters/create']}>
        <Routes>
          <Route
            path="/audiobooks/:id/chapters/create"
            element={<ChapterWizard />}
          />
          <Route
            path="/audiobooks/:id/chapters"
            element={<div>Chapters List</div>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

function renderEditWizard() {
  return render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/audiobooks/ab-1/chapters/ch-edit-1/edit',
            state: { chapter: mockChapter },
          },
        ]}
      >
        <Routes>
          <Route
            path="/audiobooks/:id/chapters/:chapterId/edit"
            element={<ChapterWizard />}
          />
          <Route
            path="/audiobooks/:id/chapters"
            element={<div>Chapters List</div>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('ChapterWizard', () => {
  beforeEach(() => {
    createChapterMock.mockReset();
    updateChapterMock.mockReset();
    createChapterMock.mockResolvedValue({ id: 'ch-new', title: 'Chapter One' });
    updateChapterMock.mockResolvedValue({
      id: 'ch-edit-1',
      title: 'Existing Chapter',
    });
    mockAudioMetadata();
    localStorage.clear();
  });

  it('renders create wizard with chapter basics', async () => {
    renderCreateWizard();
    expect(
      await screen.findByRole('heading', { name: /create new chapter/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
  });

  it('shows validation errors when continuing with empty basics', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await screen.findByLabelText(/^title/i);
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  it('shows subscription plan dropdown when paid switch is on', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await screen.findByLabelText(/^title/i);

    expect(screen.queryByLabelText(/subscription plan/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: /^paid$/i }));

    expect(
      screen.getByLabelText(/subscription plan/i).closest('.wizard-paid-plan-content')
    ).toBeInTheDocument();
  });

  it('requires a subscription plan when paid switch is on', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await fillBasicsStep(user);
    await user.click(screen.getByRole('switch', { name: /^paid$/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByText(/please select a subscription plan/i)
    ).toBeInTheDocument();
  });

  it('updates live preview with subscription plan when selected', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await fillBasicsStep(user);
    await user.click(screen.getByRole('switch', { name: /^paid$/i }));
    await user.selectOptions(
      screen.getByLabelText(/subscription plan/i),
      'Standard Plan'
    );

    expect(
      screen.getByText(/subscription plan: standard plan/i)
    ).toBeInTheDocument();
  });

  it('publishes a paid chapter with subscription tier', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await fillBasicsStep(user);
    await user.click(screen.getByRole('switch', { name: /^paid$/i }));
    await user.selectOptions(
      screen.getByLabelText(/subscription plan/i),
      'Standard Plan'
    );
    await user.click(screen.getByRole('button', { name: /continue/i }));

    const audioInput = await screen.findByLabelText(/audio file/i);
    await user.upload(audioInput, testAudioFile);
    await screen.findByText(/chapter\.mp3/i);
    await user.click(screen.getByRole('button', { name: /continue/i }));

    const coverInputs = document.querySelectorAll('input[type="file"]');
    const coverInput = coverInputs[coverInputs.length - 1] as HTMLInputElement;
    await user.upload(coverInput, testCoverFile);
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await user.click(screen.getByRole('button', { name: /^publish$/i }));

    await waitFor(() => {
      expect(createChapterMock).toHaveBeenCalledTimes(1);
    });

    expect(createChapterMock.mock.calls[0][0]).toMatchObject({
      minSubscriptionTier: 2,
    });
  });

  it('loads audio metadata on file upload', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await uploadAudioFile(user);

    expect(await screen.findByDisplayValue('02:00')).toBeInTheDocument();
    expect(screen.getByText(/chapter\.mp3/i)).toBeInTheDocument();
  });

  it('updates live preview with chapter title', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await screen.findByLabelText(/^title/i);
    await user.type(screen.getByLabelText(/^title/i), 'Preview Chapter');

    expect(screen.getByText('Preview Chapter')).toBeInTheDocument();
  });

  it('publishes a new chapter from the review step', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await advanceToReviewStep(user);

    expect(screen.getAllByText('Chapter One').length).toBeGreaterThan(0);
    await user.click(
      screen.getByRole('button', { name: /^publish$/i })
    );

    await waitFor(() => {
      expect(createChapterMock).toHaveBeenCalledTimes(1);
    });

    expect(createChapterMock.mock.calls[0][0]).toMatchObject({
      audiobookId: 'ab-1',
      title: 'Chapter One',
      description: 'Opening chapter description.',
    });
    expect(await screen.findByText('Chapters List')).toBeInTheDocument();
  });

  it('keeps schedule disabled until a date and time are chosen', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await advanceToReviewStep(user);

    expect(screen.getByRole('button', { name: /^schedule$/i })).toBeDisabled();

    await user.click(
      screen.getByRole('button', { name: /choose schedule date and time/i })
    );
    const enabledDays = document.querySelectorAll(
      '.react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled)'
    );
    await user.click(enabledDays[enabledDays.length - 1] as HTMLElement);
    await user.click(screen.getByRole('button', { name: /^done$/i }));

    expect(screen.getByRole('button', { name: /^schedule$/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /^publish$/i })).toBeDisabled();
    expect(createChapterMock).not.toHaveBeenCalled();
  });

  it('hydrates edit mode and updates without requiring a new audio file', async () => {
    const user = userEvent.setup();
    renderEditWizard();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Chapter')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/subscription plan/i)).toHaveValue('2');

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/chapter-audio\.mp3/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('03:00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByAltText(/existing chapter/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/chapter-audio\.mp3/i)).toBeInTheDocument();
    expect(screen.getByText(/existing cover/i)).toBeInTheDocument();
    expect(screen.getAllByText(/standard plan/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /^update$/i }));

    await waitFor(() => {
      expect(updateChapterMock).toHaveBeenCalledTimes(1);
    });

    expect(updateChapterMock.mock.calls[0][0]).toMatchObject({
      chapterId: 'ch-edit-1',
      title: 'Existing Chapter',
    });
  });
});
