/**
 * Main Layout component with TopNavigation and SideNavigation
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../hooks/redux';
import { useUserProfile } from '../../hooks/useUserProfile';
import { setSearchQuery } from '../../store/slices/audiobooksSlice';
import TopNavigation from './TopNavigation';
import SideNavigation from './SideNavigation';
import PageTransition from './PageTransition';
import '../../styles/components/layout/Layout.css';
const Layout: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const dispatch = useAppDispatch();
  const location = useLocation();
  useUserProfile();
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
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
