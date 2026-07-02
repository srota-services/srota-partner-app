import React from 'react';
import toast from 'react-hot-toast';
import type { ApiError } from '../types/auth';

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
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--toast-error-text)',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '18px',
            lineHeight: '1',
            opacity: 0.8,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.8';
          }}
          aria-label="Close"
        >
          ×
        </button>
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
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--toast-success-text)',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '18px',
            lineHeight: '1',
            opacity: 0.8,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.8';
          }}
          aria-label="Close"
        >
          ×
        </button>
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
