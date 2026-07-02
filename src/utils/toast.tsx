import React from 'react';
import toast from 'react-hot-toast';
import CloseButton from '../components/common/CloseButton';
import type { ApiError } from '../types/auth';

/** Absolute positioning for the toast close button. */
const TOAST_CLOSE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
};

/**
 * Extracts error message from API error or unknown error
 * @param error - The error object (ApiError or unknown)
 * @returns The error message string
 */
function extractErrorMessage(error: ApiError | unknown): string {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Shows an error toast notification for API errors
 * @param error - The API error or unknown error
 * @param duration - Optional duration in milliseconds (default: 5000)
 */
export function showApiError(
  error: ApiError | unknown,
  duration: number = 5000
): void {
  const message = extractErrorMessage(error);
  toast(
    (t): React.ReactElement => (
      <div style={{ position: 'relative', paddingRight: '24px' }}>
        <span>{message}</span>
        <CloseButton
          size="sm"
          style={TOAST_CLOSE_STYLE}
          onClick={() => toast.dismiss(t.id)}
        />
      </div>
    ),
    {
      duration,
      position: 'top-right',
      style: {
        background: 'var(--toast-error-bg)',
        color: 'var(--toast-error-text)',
        border: '1px solid var(--toast-error-border)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: undefined,
    }
  );
}

/**
 * Shows a success toast notification
 * @param message - The success message
 * @param duration - Optional duration in milliseconds (default: 3000)
 */
export function showSuccess(message: string, duration: number = 3000): void {
  toast(
    (t): React.ReactElement => (
      <div style={{ position: 'relative', paddingRight: '24px' }}>
        <span>{message}</span>
        <CloseButton
          size="sm"
          style={TOAST_CLOSE_STYLE}
          onClick={() => toast.dismiss(t.id)}
        />
      </div>
    ),
    {
      duration,
      position: 'top-right',
      style: {
        background: 'var(--toast-success-bg)',
        color: 'var(--toast-success-text)',
        border: '1px solid var(--toast-success-border)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: undefined,
    }
  );
}
