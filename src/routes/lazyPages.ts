/**
 * Central definitions for the app's lazily-loaded pages.
 *
 * Guest pages use plain React.lazy. Protected pages use lazyWithPreload so
 * their chunks can be warmed during idle time (see Layout), which keeps page
 * transitions animating consistently — including right after login.
 */
import { lazy } from 'react';
import { lazyWithPreload } from '../utils/lazyWithPreload';

// Guest / public pages
export const Landing = lazy(() => import('../pages/landing/Landing'));
export const Login = lazy(() => import('../pages/login/Login'));
export const ForgotPassword = lazy(
  () => import('../pages/forgot-password/ForgotPassword')
);
export const PartnerRegister = lazy(
  () => import('../pages/partner/PartnerRegister')
);

// Layout shell (preloadable so it is cached before the first protected route)
export const Layout = lazyWithPreload(
  () => import('../components/layout/Layout')
);

// Protected pages
export const Audiobooks = lazyWithPreload(
  () => import('../pages/audiobooks/Audiobooks')
);
export const AudiobookWizard = lazyWithPreload(
  () => import('../pages/audiobooks/AudiobookWizard')
);
export const Chapters = lazyWithPreload(
  () => import('../pages/chapters/Chapters')
);
export const ChapterWizard = lazyWithPreload(
  () => import('../pages/chapters/ChapterWizard')
);
export const Dashboard = lazyWithPreload(
  () => import('../pages/dashboard/Dashboard')
);
export const Analytics = lazyWithPreload(
  () => import('../pages/analytics/Analytics')
);
export const Management = lazyWithPreload(
  () => import('../pages/management/Management')
);
export const Team = lazyWithPreload(() => import('../pages/team/Team'));
export const Inbox = lazyWithPreload(() => import('../pages/inbox/Inbox'));
export const Settings = lazyWithPreload(
  () => import('../pages/settings/Settings')
);

/**
 * Preloadable protected page chunks, warmed during idle time after the Layout
 * mounts so navigation transitions animate reliably.
 */
export const PRELOADABLE_PAGES = [
  Dashboard,
  Audiobooks,
  AudiobookWizard,
  Chapters,
  ChapterWizard,
  Analytics,
  Management,
  Team,
  Inbox,
  Settings,
];
