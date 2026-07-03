import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/store/slices/authSlice';
import organizationAuthorsReducer from '../src/store/slices/organizationAuthorsSlice';
import type { LoginAppType, UserRole } from '../src/types/auth';
import Marketplace from '../src/pages/marketplace/Marketplace';
import Management from '../src/pages/management/Management';
import Team from '../src/pages/team/Team';
import OrganizationSearchPanel from '../src/pages/marketplace/components/OrganizationSearchPanel';

vi.mock('../src/pages/marketplace/components/AuthorSearchPanel', () => ({
  default: () => <div data-testid="author-search-panel">Author search</div>,
}));

vi.mock('../src/utils/audiobookApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/utils/audiobookApi')>();
  return {
    ...actual,
    getAllOrganizations: vi.fn().mockResolvedValue({
      organizations: [
        {
          id: 'org-1',
          name: 'Acme Publishing',
          slug: 'acme',
          description: 'A publisher',
        },
      ],
    }),
    getAuthors: vi.fn().mockResolvedValue([]),
  };
});

vi.mock('../src/utils/authorInvitationApi', () => ({
  getMyOrganizationInvitations: vi.fn().mockResolvedValue([]),
  getOrganizationAuthors: vi.fn().mockResolvedValue([]),
  getOrganizationInvitations: vi.fn().mockResolvedValue([]),
}));

vi.mock('../src/utils/partnerApi', () => ({
  getMyAuthorProfile: vi.fn().mockResolvedValue({
    id: 'author-1',
    userId: 'user-1',
    slug: 'author-one',
    organizations: [],
  }),
}));

vi.mock('../src/utils/resolveOrganizationId', () => ({
  resolveOrganizationId: vi.fn().mockResolvedValue('org-1'),
}));

function renderWithAuth(
  ui: ReactElement,
  options: {
    role?: UserRole | null;
    appType?: LoginAppType | null;
    orgAuthorsState?: {
      linkedAuthors?: [];
      invitations?: [];
      loading?: boolean;
    };
  } = {}
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      organizationAuthors: organizationAuthorsReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isInitialized: true,
        role: options.role ?? null,
        appType: options.appType ?? null,
        workspaceSlug: null,
        user: { id: 'user-1', email: 'test@example.com' },
      },
      organizationAuthors: {
        organizationId: 'org-1',
        linkedAuthors: options.orgAuthorsState?.linkedAuthors ?? [],
        invitations: options.orgAuthorsState?.invitations ?? [],
        loading: options.orgAuthorsState?.loading ?? false,
        inviting: false,
        error: null,
      },
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe('Marketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AuthorSearchPanel for organization context', () => {
    renderWithAuth(<Marketplace />, {
      role: 'ORG_ADMIN',
      appType: 'organization',
    });

    expect(screen.getByTestId('author-search-panel')).toBeInTheDocument();
    expect(
      screen.queryByTestId('organization-search-panel')
    ).not.toBeInTheDocument();
  });

  it('renders OrganizationSearchPanel for author context', () => {
    renderWithAuth(<Marketplace />, {
      role: 'AUTHOR',
      appType: 'author',
    });

    expect(
      screen.getByText(/discover organizations and request to connect/i)
    ).toBeInTheDocument();
  });
});

describe('OrganizationSearchPanel', () => {
  it('renders a disabled Request to join button with coming soon affordance', async () => {
    render(
      <Provider
        store={configureStore({
          reducer: {
            auth: authReducer,
            organizationAuthors: organizationAuthorsReducer,
          },
        })}
      >
        <OrganizationSearchPanel />
      </Provider>
    );

    const button = await screen.findByRole('button', {
      name: /request to join — coming soon/i,
    });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Coming soon');
  });
});

describe('Management', () => {
  it('renders empty Assets section', () => {
    renderWithAuth(<Management />);

    expect(screen.getByRole('heading', { name: /^manage$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^assets$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/no assets yet\. asset management will be available here/i)
    ).toBeInTheDocument();
  });
});

describe('Team', () => {
  it('renders Linked and Invitations tabs for org staff', () => {
    renderWithAuth(<Team />, {
      role: 'ORG_ADMIN',
      appType: 'organization',
      orgAuthorsState: { loading: false },
    });

    expect(screen.getByRole('button', { name: 'Linked' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Invitations' })
    ).toBeInTheDocument();
  });

  it('shows placeholder for non-org users', () => {
    renderWithAuth(<Team />, {
      role: 'AUTHOR',
      appType: 'author',
    });

    expect(
      screen.getByText(/team management is available for organization accounts/i)
    ).toBeInTheDocument();
  });
});
