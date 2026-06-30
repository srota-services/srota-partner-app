/**
 * Utility functions for formatting data
 */

/** Extracts a readable filename from a URL for existing asset display. */
export function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const fileName = decodeURIComponent(pathname.split('/').pop() || '');
    return fileName || 'Existing file';
  } catch {
    const fallback = url.split('/').pop() || 'Existing file';
    return decodeURIComponent(fallback);
  }
}
/**
 * Formats duration in seconds to human-readable format (e.g., "2h 30m")
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds?: number): string {
  if (seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '--';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '< 1m';
  }
}
/**
 * Formats duration in seconds to detailed format (e.g., "2h 30m 15s")
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDurationDetailed(seconds?: number): string {
  if (seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '--:--:--';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
/**
 * Formats a date string to IST (Indian Standard Time) format
 * @param dateString - Date string in ISO format or datetime-local format
 * @returns Formatted date string in IST (e.g., "Jan 15, 2024 at 3:30 PM IST")
 */
export function formatDateToIST(dateString?: string): string {
  if (!dateString) {
    return '';
  }
  try {
    // Parse the date string (handles both ISO format and datetime-local format)
    let date: Date;
    // If it's in datetime-local format (YYYY-MM-DDTHH:mm), treat it as local time
    if (
      dateString.includes('T') &&
      !dateString.includes('Z') &&
      !dateString.includes('+')
    ) {
      // datetime-local format - treat as local time
      date = new Date(dateString);
    } else {
      // ISO format or other - parse normally
      date = new Date(dateString);
    }
    if (isNaN(date.getTime())) {
      return '';
    }
    // Format date in IST timezone
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    };

    const formattedDate = date.toLocaleString('en-IN', options);
    return `${formattedDate} IST`;
  } catch (error) {
    console.error('Error formatting date to IST:', error);
    return '';
  }
}
