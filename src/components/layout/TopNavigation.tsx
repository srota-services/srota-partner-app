import React, { useState, useRef, useMemo } from 'react';
import { Bell, CircleHelp } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import type { AuthUser } from '../../store/slices/authSlice';
import Logo from '../common/Logo';
import SearchBar from '../common/SearchBar';
import ProfileDropdown from '../common/ProfileDropdown';
import AppImage from '../common/AppImage';
import '../../styles/components/layout/TopNavigation.css';

interface TopNavigationProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

function getInitials(user: AuthUser | null): string {
  if (user?.name) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0]?.charAt(0) ?? '';
      const second = parts[1]?.charAt(0) ?? '';
      return (first + second).toUpperCase();
    }
    if (parts[0]) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }
  if (user?.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return 'SP';
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  searchValue,
  onSearchChange,
}) => {
  const user = useAppSelector(state => state.auth.user);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const initials = useMemo(() => getInitials(user), [user]);

  return (
    <nav className="top-navigation">
      <div className="top-nav-left">
        <Logo to="/dashboard" />
      </div>
      <div className="top-nav-center">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search audiobooks, authors, or ISBN..."
        />
        <kbd className="top-nav-search-hint">⌘K</kbd>
      </div>
      <div className="top-nav-right">
        <button className="top-nav-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="top-nav-notification-badge" />
        </button>
        <button className="top-nav-icon-btn" aria-label="Help">
          <CircleHelp size={20} />
        </button>
        <div className="profile-dropdown-wrapper">
          <button
            ref={profileButtonRef}
            className="top-nav-avatar"
            aria-label="Profile"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            aria-expanded={isProfileDropdownOpen}
          >
            <AppImage
              src={user?.avatarUrl}
              alt=""
              variant="author"
              className="top-nav-avatar-image"
              fallback={initials}
            />
          </button>
          <ProfileDropdown
            isOpen={isProfileDropdownOpen}
            onClose={() => setIsProfileDropdownOpen(false)}
            triggerRef={profileButtonRef}
          />
        </div>
      </div>
    </nav>
  );
};

export default React.memo(TopNavigation);
