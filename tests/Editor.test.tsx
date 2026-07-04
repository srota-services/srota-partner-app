import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/store/slices/authSlice';
import Editor from '../src/pages/editor/Editor';

const mockGetAudiobooks = vi.fn();
const mockGetChapters = vi.fn();
const mockGetPagesByChapterId = vi.fn();
const mockResolveOwnerId = vi.fn();

vi.mock('../src/utils/audiobookApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/utils/audiobookApi')>();
  return {
    ...actual,
    getAudiobooks: (...args: unknown[]) => mockGetAudiobooks(...args),
    getChapters: (...args: unknown[]) => mockGetChapters(...args),
    getPagesByChapterId: (...args: unknown[]) => mockGetPagesByChapterId(...args),
  };
});

vi.mock('../src/utils/resolveAudiobookFetchOwnerId', () => ({
  resolveAudiobookFetchOwnerId: (...args: unknown[]) => mockResolveOwnerId(...args),
}));

function renderEditor(initialEntry = '/editor') {
  const ui: ReactElement = (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/editor/*" element={<Editor />} />
      </Routes>
    </MemoryRouter>
  );

  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isInitialized: true,
        role: 'AUTHOR',
        appType: 'author',
        workspaceSlug: null,
        user: {
          id: 'user-1',
          email: 'author@example.com',
          name: 'Jane Author',
        },
      },
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe('Editor', () => {
  beforeEach(() => {
    mockResolveOwnerId.mockResolvedValue('author-1');
    mockGetAudiobooks.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'ab-authoring-1',
          type: 'AUTHORING',
          title: 'The Great Epic',
          author: 'Ravi Sharma',
          description: '',
        },
      ],
      message: '',
      statusCode: 200,
      timestamp: '',
      path: '',
    });
    mockGetChapters.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'ch-1',
          audiobookId: 'ab-authoring-1',
          title: 'Introduction',
          description: '',
          chapterNumber: 1,
        },
      ],
      message: '',
      statusCode: 200,
      timestamp: '',
      path: '',
    });
    mockGetPagesByChapterId.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'pg-1-1',
          chapterId: 'ch-1',
          pageNumber: 1,
          plainText: 'Welcome',
          richText: { type: 'doc', content: [] },
        },
      ],
      message: '',
      statusCode: 200,
      timestamp: '',
      path: '',
    });
  });

  it('loads authoring audiobooks and shows empty workspace until a page is selected', async () => {
    renderEditor();

    await waitFor(() => {
      expect(mockGetAudiobooks).toHaveBeenCalledWith(
        1,
        undefined,
        undefined,
        'author-1',
        'AUTHORING'
      );
    });

    expect(
      screen.getByText(/select or create a chapter and page to start writing/i)
    ).toBeInTheDocument();
    expect(screen.getByText('The Great Epic')).toBeInTheDocument();
  });

  it('shows audiobook creation control in the directory tree', async () => {
    renderEditor();

    await waitFor(() => {
      expect(screen.getByText('The Great Epic')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /^audiobook$/i })).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: /resize editor sidebar/i })).toBeInTheDocument();
  });

  it('adds a new audiobook row and opens rename input', async () => {
    const user = userEvent.setup();
    renderEditor('/editor');

    await waitFor(() => {
      expect(screen.getByText('The Great Epic')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^audiobook$/i }));

    expect(screen.getByRole('textbox', { name: /rename audiobook/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/new audiobook/i)).toBeInTheDocument();
  });
});
