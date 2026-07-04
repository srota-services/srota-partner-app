import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import { updatePage } from '../utils/audiobookApi';

export const AUTO_SAVE_INTERVAL_MS = 10_000;
export const TYPING_IDLE_MS = 2_000;

export interface EditorPageContent {
  plainText: string;
  richText: JSONContent;
}

interface UseEditorAutoSaveOptions {
  pageId: string | null;
  chapterId: string | null;
  pageNumber: number | null;
  isDirty: boolean;
  isLocalPage: boolean;
  getContent: () => EditorPageContent | null;
  onSaved: (pageId: string) => void;
  onEdit: () => void;
}

export function useEditorAutoSave({
  pageId,
  chapterId,
  pageNumber,
  isDirty,
  isLocalPage,
  getContent,
  onSaved,
  onEdit,
}: UseEditorAutoSaveOptions): { markEdited: () => void; isSaving: boolean } {
  const lastEditAtRef = useRef(0);
  const savingRef = useRef(false);
  const getContentRef = useRef(getContent);
  const onSavedRef = useRef(onSaved);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getContentRef.current = getContent;
    onSavedRef.current = onSaved;
  }, [getContent, onSaved]);

  const markEdited = useCallback(() => {
    lastEditAtRef.current = Date.now();
    onEdit();
  }, [onEdit]);

  useEffect(() => {
    if (!pageId || !chapterId || pageNumber == null || isLocalPage) {
      setIsSaving(false);
      return;
    }

    const intervalId = window.setInterval(async () => {
      if (!isDirty || savingRef.current) {
        return;
      }

      if (Date.now() - lastEditAtRef.current < TYPING_IDLE_MS) {
        return;
      }

      const content = getContentRef.current();
      if (!content) {
        return;
      }

      savingRef.current = true;
      setIsSaving(true);
      try {
        await updatePage(pageId, {
          chapterId,
          pageNumber,
          plainText: content.plainText,
          richText: content.richText,
        });
        onSavedRef.current(pageId);
      } catch (error) {
        console.error('Failed to auto-save page:', error);
      } finally {
        savingRef.current = false;
        setIsSaving(false);
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      setIsSaving(false);
    };
  }, [pageId, chapterId, pageNumber, isDirty, isLocalPage]);

  return { markEdited, isSaving };
}
