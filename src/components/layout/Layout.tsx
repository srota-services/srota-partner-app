/**
 * Main Layout component with TopNavigation and SideNavigation
 */
import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../hooks/redux';
import { useUserProfile } from '../../hooks/useUserProfile';
import { setSearchQuery } from '../../store/slices/audiobooksSlice';
import { PRELOADABLE_PAGES } from '../../routes/lazyPages';
import { preloadDuringIdle } from '../../utils/lazyWithPreload';
import TopNavigation from './TopNavigation';
import SideNavigation from './SideNavigation';
import PageTransition from './PageTransition';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components/layout/Layout.css';

/** Lightweight fallback that occupies the content area (not full-screen). */
const PageFallback: React.FC = () => (
  <div className="layout-page-fallback">
    <LoadingSpinner />
  </div>
);

const Layout: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const dispatch = useAppDispatch();
  const location = useLocation();
  useUserProfile();

  // Warm the protected page chunks during idle time so navigation transitions
  // animate consistently (including right after login).
  useEffect(() => {
    preloadDuringIdle(PRELOADABLE_PAGES);
  }, []);

  // Update Redux search query when search value changes and we're on audiobooks page
  useEffect(() => {
    if (location.pathname.startsWith('/library')) {
      dispatch(setSearchQuery(searchValue));
    }
  }, [searchValue, location.pathname, dispatch]);

  return (
    <div className="layout">
      <TopNavigation
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      <div className="layout-content">
        <SideNavigation />
        <main className="layout-main">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
