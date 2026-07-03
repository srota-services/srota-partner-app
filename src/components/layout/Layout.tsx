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
import { getPageTransitionKey } from '../../utils/pageTransitionKey';
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
  const isEditorRoute = location.pathname.startsWith('/editor');
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(isEditorRoute);
  useUserProfile();

  // Warm the protected page chunks during idle time so navigation transitions
  // animate consistently (including right after login).
  useEffect(() => {
    preloadDuringIdle(PRELOADABLE_PAGES);
  }, []);

  useEffect(() => {
    if (isEditorRoute) {
      setIsSideNavCollapsed(true);
    }
  }, [isEditorRoute]);

  // Update Redux search query when search value changes and we're on audiobooks page
  useEffect(() => {
    if (location.pathname.startsWith('/library')) {
      dispatch(setSearchQuery(searchValue));
    }
  }, [searchValue, location.pathname, dispatch]);

  const mainClassName = [
    'layout-main',
    isEditorRoute ? 'layout-main--editor' : '',
    isEditorRoute && isSideNavCollapsed ? 'layout-main--editor-collapsed' : '',
    isEditorRoute && !isSideNavCollapsed ? 'layout-main--editor-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="layout">
      <TopNavigation
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      <div className="layout-content">
        <SideNavigation
          collapsed={isEditorRoute && isSideNavCollapsed}
          onToggleCollapse={
            isEditorRoute
              ? () => setIsSideNavCollapsed(prev => !prev)
              : undefined
          }
        />
        <main className={mainClassName}>
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={getPageTransitionKey(location.pathname)}>
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
