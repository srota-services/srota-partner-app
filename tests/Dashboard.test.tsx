import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/store/slices/authSlice';
import type { LoginAppType, UserRole } from '../src/types/auth';
import Dashboard from '../src/pages/dashboard/Dashboard';

vi.mock('../src/hooks/useCurrentOrganization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    organization: null,
    loading: false,
  })),
}));

function renderDashboard(
  options: {
    role?: UserRole | null;
    appType?: LoginAppType | null;
    userName?: string;
  } = {}
) {
  const ui: ReactElement = (
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isInitialized: true,
        role: options.role ?? null,
        appType: options.appType ?? null,
        workspaceSlug: null,
        user: {
          id: 'user-1',
          email: 'author@example.com',
          name: options.userName ?? 'Jane Author',
        },
      },
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe('Dashboard', () => {
  it('shows a welcome message for author context', () => {
    renderDashboard({
      role: 'AUTHOR',
      appType: 'author',
      userName: 'Jane Author',
    });

    expect(screen.getByText('Welcome, Jane Author!')).toBeInTheDocument();
    expect(
      screen.getByText(/your author workspace is ready/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Marketplace' })).toHaveAttribute(
      'href',
      '/marketplace'
    );
    expect(
      screen.queryByText('Analytics dashboard coming soon...')
    ).not.toBeInTheDocument();
  });

  it('shows the analytics placeholder for organization context', () => {
    renderDashboard({
      role: 'ORG_ADMIN',
      appType: 'organization',
    });

    expect(
      screen.getByText('Analytics dashboard coming soon...')
    ).toBeInTheDocument();
    expect(screen.queryByText(/welcome,/i)).not.toBeInTheDocument();
  });
});
