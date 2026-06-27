/**
 * Profile Dropdown component
 */
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Settings, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleTheme } from '../../store/slices/themeSlice';
import { logout } from '../../utils/api';
import { clearClientAuthSession } from '../../utils/authSession';
import { showApiError } from '../../utils/toast';
import '../../styles/components/common/ProfileDropdown.css';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleSettings = () => {
    navigate('/settings');
    onClose();
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showApiError(error);
    } finally {
      clearClientAuthSession(dispatch);
      navigate('/login', { replace: true });
      onClose();
    }
  };

  if (!isOpen) return null;

  const isDarkMode = themeMode === 'dark';
  const ThemeIcon = isDarkMode ? Sun : Moon;

  return (
    <div ref={dropdownRef} className="profile-dropdown">
      <button
        type="button"
        className="profile-dropdown-item"
        onClick={handleSettings}
      >
        <Settings size={16} aria-hidden="true" />
        <span>Settings</span>
      </button>

      <button
        type="button"
        className="profile-dropdown-item profile-dropdown-theme"
        onClick={handleThemeToggle}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <ThemeIcon size={16} aria-hidden="true" />
        <span className="profile-dropdown-theme-label">
          {isDarkMode ? 'Light mode' : 'Dark mode'}
        </span>
        <span
          className={`profile-dropdown-theme-switch${isDarkMode ? ' profile-dropdown-theme-switch--on' : ''}`}
          aria-hidden="true"
        >
          <span className="profile-dropdown-theme-switch-thumb" />
        </span>
      </button>

      <div className="profile-dropdown-divider" />

      <button
        type="button"
        className="profile-dropdown-item profile-dropdown-logout"
        onClick={handleLogout}
      >
        <span>Logout</span>
      </button>
    </div>
  );
};

export default ProfileDropdown;
