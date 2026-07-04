import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  AUTO_SAVE_INTERVAL_MS,
  TYPING_IDLE_MS,
  useEditorAutoSave,
} from '../src/hooks/useEditorAutoSave';
import { updatePage } from '../src/utils/audiobookApi';

vi.mock('../src/utils/audiobookApi', () => ({
  updatePage: vi.fn().mockResolvedValue({ id: 'pg-1' }),
}));

describe('useEditorAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(updatePage).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-saves after 10 seconds when idle and dirty', async () => {
    const onSaved = vi.fn();
    const getContent = vi.fn(() => ({
      plainText: 'Hello',
      richText: { type: 'doc', content: [] },
    }));

    const { result } = renderHook(() =>
      useEditorAutoSave({
        pageId: 'pg-1',
        chapterId: 'ch-1',
        pageNumber: 1,
        isDirty: true,
        isLocalPage: false,
        getContent,
        onSaved,
        onEdit: vi.fn(),
      })
    );

    act(() => {
      result.current.markEdited();
    });

    act(() => {
      vi.advanceTimersByTime(TYPING_IDLE_MS);
    });

    await act(async () => {
      vi.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
      await Promise.resolve();
    });

    expect(result.current.isSaving).toBe(false);
    expect(updatePage).toHaveBeenCalledWith('pg-1', {
      chapterId: 'ch-1',
      pageNumber: 1,
      plainText: 'Hello',
      richText: { type: 'doc', content: [] },
    });
    expect(onSaved).toHaveBeenCalledWith('pg-1');
  });

  it('does not auto-save while the author is still typing', async () => {
    const getContent = vi.fn(() => ({
      plainText: 'Hello',
      richText: { type: 'doc', content: [] },
    }));

    const { result } = renderHook(() =>
      useEditorAutoSave({
        pageId: 'pg-1',
        chapterId: 'ch-1',
        pageNumber: 1,
        isDirty: true,
        isLocalPage: false,
        getContent,
        onSaved: vi.fn(),
        onEdit: vi.fn(),
      })
    );

    act(() => {
      result.current.markEdited();
    });

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS - 1_000);
    });

    act(() => {
      result.current.markEdited();
    });

    await act(async () => {
      vi.advanceTimersByTime(1_000);
      await Promise.resolve();
    });

    expect(updatePage).not.toHaveBeenCalled();
  });
});
