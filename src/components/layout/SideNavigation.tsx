import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  LayoutDashboard,
  PenLine,
  Store,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import SolidIcon from '../common/SolidIcon';
import '../../styles/components/layout/SideNavigation.css';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Library', path: '/library', icon: BookOpen },
  { label: 'Editor', path: '/editor', icon: PenLine },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Discovery', path: '/discovery', icon: Store },
  { label: 'Manage', path: '/management', icon: Upload },
  { label: 'Inbox', path: '/inbox', icon: Inbox },
];

function isNavActive(item: NavItem, pathname: string): boolean {
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

interface SideNavigationProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const appType = useAppSelector(state => state.auth.appType);

  const visibleNavItems = useMemo(
    () =>
      navItems.filter(item => (item.path === '/editor' ? appType === 'author' : true)),
    [appType]
  );

  return (
    <nav
      className={`side-navigation${collapsed ? ' side-navigation--collapsed' : ''}`}
      aria-label="Main navigation"
    >
      <ul className="side-nav-list">
        {visibleNavItems.map(item => {
          const isActive = isNavActive(item, location.pathname);
          const Icon = item.icon;

          return (
            <li key={item.path}>
              <button
                className={`side-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                <SolidIcon icon={Icon} size={18} className="side-nav-icon" />
                <span className="side-nav-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {onToggleCollapse && (
        <button
          type="button"
          className="side-nav-collapse-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <SolidIcon
            icon={collapsed ? ChevronsRight : ChevronsLeft}
            size={18}
          />
          {!collapsed && (
            <span className="side-nav-label">
              {collapsed ? 'Expand' : 'Collapse'}
            </span>
          )}
        </button>
      )}
    </nav>
  );
};

export default React.memo(SideNavigation);
