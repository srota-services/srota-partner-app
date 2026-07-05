/**
 * Wraps React.lazy so the underlying dynamic import can be triggered ahead of
 * time via `.preload()`. Preloading route chunks before navigation keeps the
 * AnimatePresence page transitions from being interrupted by Suspense
 * fallbacks (which otherwise makes animations fire only "sometimes").
 *
 * The generic constraint mirrors React's own `lazy` signature
 * (`ComponentType<any>`), which is required so components with any prop shape
 * remain valid JSX elements. `any` is intentionally scoped to this generic
 * utility only.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

type ImportFn<T extends ComponentType<any>> = () => Promise<{
  default: T;
}>;

export type PreloadableComponent<T extends ComponentType<any>> =
  LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };

export function lazyWithPreload<T extends ComponentType<any>>(
  importFn: ImportFn<T>
): PreloadableComponent<T> {
  const Component = lazy(importFn) as PreloadableComponent<T>;
  // Cache the promise so repeated preload calls don't re-trigger the import.
  let cached: Promise<{ default: T }> | null = null;
  Component.preload = () => {
    if (!cached) {
      cached = importFn();
    }
    return cached;
  };
  return Component;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Preloads a batch of preloadable components during idle time so they are
 * cached before the user navigates. Falls back to setTimeout when
 * requestIdleCallback is unavailable.
 */
export function preloadDuringIdle(
  components: Array<{ preload: () => Promise<unknown> }>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const run = () => {
    components.forEach(component => {
      void component.preload().catch(() => {
        // Ignore preload failures; the chunk will load normally on navigation.
      });
    });
  };

  const idle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    }
  ).requestIdleCallback;

  if (typeof idle === 'function') {
    idle(run);
  } else {
    window.setTimeout(run, 200);
  }
}
