/**
 * Shared motion tokens and variants for consistent animations across the app.
 *
 * All framer-motion animations should consume these so easing/durations stay
 * identical everywhere (page transitions, tab switches, modals, etc.).
 */
import type { Transition, Variants } from 'framer-motion';

/** Standard easing curve used across the app (ease-out-quint style). */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Shared animation durations (seconds). */
export const DURATION = {
  fast: 0.2,
  base: 0.3,
} as const;

/**
 * Returns true when the user has requested reduced motion. Guards against
 * non-browser environments (e.g. tests) where matchMedia is unavailable.
 */
export function prefersReducedMotion(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Page-level transition variants. When reduced motion is requested, we keep
 * the fade but drop the vertical movement so navigation stays comfortable.
 */
export function getPageVariants(): Variants {
  const reduce = prefersReducedMotion();
  return {
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -20 },
  };
}

/** Transition config for page-level animations. */
export function getPageTransition(): Transition {
  return { duration: DURATION.base, ease: EASE };
}

/**
 * In-page tab content variants (subtler than full page transitions).
 */
export function getTabVariants(): Variants {
  const reduce = prefersReducedMotion();
  return {
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -8 },
  };
}

/** Transition config for in-page tab animations. */
export function getTabTransition(): Transition {
  return { duration: DURATION.fast, ease: EASE };
}

/** Overlay (backdrop) fade variants for modals/dialogs. */
export function getOverlayVariants(): Variants {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
}

/** Modal content variants. Reduced motion keeps a plain fade. */
export function getModalVariants(): Variants {
  const reduce = prefersReducedMotion();
  return {
    initial: { opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 20 },
  };
}
