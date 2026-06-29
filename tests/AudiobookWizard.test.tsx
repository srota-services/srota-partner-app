import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { store } from '../src/store/store';
import AudiobookWizard from '../src/pages/audiobooks/AudiobookWizard';
import { mockAudiobook, testCoverFile } from './wizardTestHelpers';

const { createAudiobookMock, updateAudiobookMock } = vi.hoisted(() => ({
  createAudiobookMock: vi.fn(),
  updateAudiobookMock: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../src/utils/config', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/utils/config')>();
  return {
    ...actual,
    isPartnerApp: vi.fn(() => true),
  };
});

vi.mock('../src/utils/resolveAudiobookOwner', () => ({
  resolveAudiobookOwner: vi.fn().mockResolvedValue({
    type: 'ORGANIZATION',
    id: 'org-123',
  }),
}));

vi.mock('../src/utils/audiobookApi', async importOriginal => {
  const actual =
    await importOriginal<typeof import('../src/utils/audiobookApi')>();
  return {
    ...actual,
    createAudiobook: createAudiobookMock,
    updateAudiobook: updateAudiobookMock,
    getGenres: vi.fn().mockResolvedValue([
      {
        id: 'genre-1',
        name: 'Fiction',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]),
    getTags: vi.fn().mockResolvedValue([
      {
        id: 'tag-1',
        name: 'Bestseller',
        type: 'general',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]),
    getMoods: vi.fn().mockResolvedValue([
      {
        id: 'mood-1',
        name: 'Calm',
        color: '#38BDF8',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]),
    getSubscriptionPlans: vi.fn().mockResolvedValue([
      { name: 'Base Plan' },
      { name: 'Standard Plan' },
      { name: 'Premium Plan' },
    ]),
    getAudiobooks: vi.fn().mockResolvedValue({
      success: true,
      data: [],
      message: '',
      statusCode: 200,
      timestamp: '2024-01-01T00:00:00.000Z',
      path: '',
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
  };
});

async function waitForCatalogOptions() {
  await waitFor(() => {
    expect(screen.getByRole('checkbox', { name: /fiction/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /calm/i })).toBeInTheDocument();
  });
}

async function fillBasicsStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText(/audiobook title/i),
    'My New Audiobook'
  );
  await user.type(
    screen.getByLabelText(/short description/i),
    'A compelling story.'
  );
  await user.click(screen.getByRole('checkbox', { name: /fiction/i }));
  await user.click(screen.getByRole('checkbox', { name: /bestseller/i }));
  await user.selectOptions(screen.getByLabelText(/^language$/i), 'Hindi');
}

async function advanceToContributors(user: ReturnType<typeof userEvent.setup>) {
  await fillBasicsStep(user);
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByLabelText(/^author/i);
}

async function advanceToCoverStep(user: ReturnType<typeof userEvent.setup>) {
  await advanceToContributors(user);
  await user.type(screen.getByLabelText(/^author/i), 'Jane Author');
  await user.click(screen.getByRole('button', { name: /continue/i }));
}

async function advanceToSubscriptionTiersStep(
  user: ReturnType<typeof userEvent.setup>
) {
  await advanceToCoverStep(user);
  const coverInput = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  await user.upload(coverInput, testCoverFile);
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByRole('radio', { name: /^none$/i });
}

async function advanceToReviewStep(user: ReturnType<typeof userEvent.setup>) {
  await advanceToSubscriptionTiersStep(user);
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByRole('button', { name: /^publish$/i });
}

function renderCreateWizard() {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/audiobooks/create']}>
        <Routes>
          <Route path="/audiobooks/create" element={<AudiobookWizard />} />
          <Route path="/audiobooks" element={<div>Audiobooks List</div>} />
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
            pathname: '/audiobooks/ab-edit-1/edit',
            state: { audiobook: mockAudiobook },
          },
        ]}
      >
        <Routes>
          <Route path="/audiobooks/:id/edit" element={<AudiobookWizard />} />
          <Route path="/audiobooks" element={<div>Audiobooks List</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

function resetAudiobooksLoadingState() {
  store.dispatch({
    type: 'audiobooks/fetchAudiobooks/fulfilled',
    payload: {
      success: true,
      data: [],
      message: '',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: '',
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  });
}

describe('AudiobookWizard', () => {
  beforeEach(() => {
    createAudiobookMock.mockReset();
    updateAudiobookMock.mockReset();
    createAudiobookMock.mockResolvedValue({
      id: 'new-ab',
      title: 'My New Audiobook',
    });
    updateAudiobookMock.mockResolvedValue({
      id: 'ab-edit-1',
      title: 'Existing Audiobook',
    });
    localStorage.clear();
    resetAudiobooksLoadingState();
  });

  it('renders create wizard with step 1 basics', async () => {
    renderCreateWizard();
    expect(
      await screen.findByRole('heading', { name: /create new audiobook/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: /step 1 of 5/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/audiobook title/i)).toBeInTheDocument();
    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
  });

  it('shows validation errors when continuing with empty basics', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/at least one genre is required/i)).toBeInTheDocument();
    expect(screen.getByText(/at least one tag is required/i)).toBeInTheDocument();
  });

  it('updates live preview as the user types', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await user.type(
      screen.getByLabelText(/audiobook title/i),
      'Preview Title'
    );

    expect(screen.getByText('Preview Title')).toBeInTheDocument();
    expect(screen.getByText(/language: english/i)).toBeInTheDocument();
  });

  it('updates live preview with mood and subscription plan when selected', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();

    await fillBasicsStep(user);
    await user.click(screen.getByRole('radio', { name: /calm/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.type(screen.getByLabelText(/^author/i), 'Jane Author');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    const coverInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(coverInput, testCoverFile);
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('radio', { name: /^none$/i });
    await user.click(screen.getByRole('radio', { name: /^audiobook$/i }));
    await user.click(screen.getByRole('switch', { name: /^paid$/i }));
    await user.selectOptions(
      screen.getByLabelText(/subscription plan/i),
      '2'
    );

    const preview = screen
      .getByText(/live preview/i)
      .closest('.wizard-preview-card');
    expect(preview).not.toBeNull();
    const previewScope = within(preview as HTMLElement);

    expect(previewScope.getByText('Genres')).toBeInTheDocument();
    expect(previewScope.getByText('Fiction')).toBeInTheDocument();
    expect(previewScope.getByText('Tags')).toBeInTheDocument();
    expect(previewScope.getByText('Bestseller')).toBeInTheDocument();
    expect(previewScope.getByText('Mood')).toBeInTheDocument();

    const moodBadge = previewScope.getByText('Calm');
    expect(moodBadge).toHaveClass('audiobook-card-badge-mood');
    expect(moodBadge).toHaveStyle({
      backgroundColor: 'rgb(56, 189, 248)',
      color: 'rgb(17, 24, 39)',
    });
    expect(
      screen.getByText(/subscription plan: standard plan/i)
    ).toBeInTheDocument();
  });

  it('publishes a new audiobook with language in the create payload', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await advanceToReviewStep(user);

    expect(screen.getAllByText('My New Audiobook').length).toBeGreaterThan(0);
    expect(screen.getByText('Language')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /^publish$/i })
    );

    await waitFor(() => {
      expect(createAudiobookMock).toHaveBeenCalledTimes(1);
    });

    expect(createAudiobookMock.mock.calls[0][0]).toMatchObject({
      title: 'My New Audiobook',
      author: 'Jane Author',
      language: 'Hindi',
      genreIds: ['genre-1'],
      tagIds: ['tag-1'],
      subscriptionGatingMode: 'NONE',
    });
    expect(
      await screen.findByText('Audiobooks List')
    ).toBeInTheDocument();
  });

  it('disables publish and enables schedule after choosing a date', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await advanceToReviewStep(user);

    expect(
      screen.getByRole('button', { name: /^publish$/i })
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: /^schedule$/i })).toBeDisabled();

    await user.click(
      screen.getByRole('button', { name: /choose schedule date and time/i })
    );

    const enabledDays = document.querySelectorAll(
      '.react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled)'
    );
    await user.click(enabledDays[enabledDays.length - 1] as HTMLElement);
    await user.click(screen.getByRole('button', { name: /^done$/i }));

    expect(
      screen.getByRole('button', { name: /^publish$/i })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /^schedule$/i })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /clear schedule date and time/i })
    ).toBeInTheDocument();
  });

  it('re-enables publish after clearing a selected schedule date', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await advanceToReviewStep(user);

    await user.click(
      screen.getByRole('button', { name: /choose schedule date and time/i })
    );
    const enabledDays = document.querySelectorAll(
      '.react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled)'
    );
    await user.click(enabledDays[enabledDays.length - 1] as HTMLElement);
    await user.click(screen.getByRole('button', { name: /^done$/i }));

    await user.click(
      screen.getByRole('button', { name: /clear schedule date and time/i })
    );

    expect(
      screen.getByRole('button', { name: /^publish$/i })
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: /^schedule$/i })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /choose schedule date and time/i })
    ).toBeInTheDocument();
  });

  it('shows subscription plan dropdown when paid switch is on', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await advanceToSubscriptionTiersStep(user);

    expect(screen.queryByLabelText(/subscription plan/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^audiobook$/i }));
    await user.click(screen.getByRole('switch', { name: /^paid$/i }));

    expect(
      screen.getByLabelText(/subscription plan/i).closest('.wizard-paid-plan-content')
    ).toBeInTheDocument();
  });

  it('requires a subscription plan when paid switch is on', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await advanceToSubscriptionTiersStep(user);
    await user.click(screen.getByRole('radio', { name: /^audiobook$/i }));
    await user.click(screen.getByRole('switch', { name: /^paid$/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByText(/please select a subscription plan/i)
    ).toBeInTheDocument();
  });

  it('deselects mood when clicking the selected mood pill', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();

    const calmMood = screen.getByRole('radio', { name: /calm/i });
    await user.click(calmMood);
    expect(calmMood).toBeChecked();

    await user.click(calmMood);
    expect(calmMood).not.toBeChecked();
  });

  it('publishes paid audiobook with subscription tier and mood', async () => {
    const user = userEvent.setup();
    renderCreateWizard();
    await waitForCatalogOptions();
    await fillBasicsStep(user);
    await user.click(screen.getByRole('radio', { name: /calm/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.type(screen.getByLabelText(/^author/i), 'Jane Author');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    const coverInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(coverInput, testCoverFile);
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('radio', { name: /^none$/i });
    await user.click(screen.getByRole('radio', { name: /^audiobook$/i }));
    await user.click(screen.getByRole('switch', { name: /^paid$/i }));
    await user.selectOptions(
      screen.getByLabelText(/subscription plan/i),
      '2'
    );
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('button', { name: /^publish$/i });

    await user.click(
      screen.getByRole('button', { name: /^publish$/i })
    );

    await waitFor(() => {
      expect(createAudiobookMock).toHaveBeenCalledTimes(1);
    });

    expect(createAudiobookMock.mock.calls[0][0]).toMatchObject({
      isPublic: false,
      minSubscriptionTier: 2,
      moodId: 'mood-1',
      subscriptionGatingMode: 'AUDIOBOOK',
    });
  });

  it('hydrates edit mode and sends language on update', async () => {
    const user = userEvent.setup();
    renderEditWizard();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Audiobook')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Hindi')).toBeInTheDocument();
    expect(screen.getByText(/language: hindi/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/^language$/i), 'Spanish');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await user.click(screen.getByRole('button', { name: /^update$/i }));

    await waitFor(() => {
      expect(updateAudiobookMock).toHaveBeenCalledTimes(1);
    });

    expect(updateAudiobookMock.mock.calls[0][0]).toMatchObject({
      audiobookId: 'ab-edit-1',
      language: 'Spanish',
      title: 'Existing Audiobook',
    });
  });
});
