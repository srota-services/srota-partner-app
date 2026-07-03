/** Stable AnimatePresence key — editor deep-links must not remount the page. */
export function getPageTransitionKey(pathname: string): string {
  if (pathname.startsWith('/editor')) {
    return '/editor';
  }
  return pathname;
}
