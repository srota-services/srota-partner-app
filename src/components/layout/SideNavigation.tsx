import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Inbox,
  LayoutDashboard,
  Upload,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import SolidIcon from '../common/SolidIcon';
import '../../styles/components/layout/SideNavigation.css';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** When true, item is hidden for users with AUTHOR role */
  orgStaffOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Library', path: '/library', icon: BookOpen },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Manage', path: '/management', icon: Upload, orgStaffOnly: true },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'Inbox', path: '/inbox', icon: Inbox },
];

function isNavActive(item: NavItem, pathname: string): boolean {
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

const SideNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAppSelector(state => state.auth);

  const visibleNavItems = useMemo(
    () =>
      navItems.filter(item => !(item.orgStaffOnly && role === 'AUTHOR')),
    [role]
  );

  return (
    <nav className="side-navigation">
      <ul className="side-nav-list">
        {visibleNavItems.map(item => {
          const isActive = isNavActive(item, location.pathname);
          const Icon = item.icon;

          return (
            <li key={item.path}>
              <button
                className={`side-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <SolidIcon icon={Icon} size={18} className="side-nav-icon" />
                <span className="side-nav-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default React.memo(SideNavigation);
