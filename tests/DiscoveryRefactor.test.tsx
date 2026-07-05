import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../src/store/slices/authSlice';
import organizationAuthorsReducer from '../src/store/slices/organizationAuthorsSlice';
import organizationMembersReducer from '../src/store/slices/organizationMembersSlice';
import collaborationsReducer from '../src/store/slices/collaborationsSlice';
import type { LoginAppType, UserRole } from '../src/types/auth';
import Discovery from '../src/pages/marketplace/Marketplace';
import Management from '../src/pages/management/Management';
import OrganizationSearchPanel from '../src/pages/marketplace/components/OrganizationSearchPanel';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

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

vi.mock('../src/utils/organizationMemberApi', () => ({
  getOrganizationMembers: vi.fn().mockResolvedValue([]),
  addOrganizationMember: vi.fn(),
  updateOrganizationMemberRole: vi.fn(),
  removeOrganizationMember: vi.fn(),
}));

vi.mock('../src/utils/authorCollaborationApi', () => ({
  getMyAuthorCollaborations: vi.fn().mockResolvedValue([]),
  getOrganizationCollaborations: vi.fn().mockResolvedValue([]),
  createAuthorCollaboration: vi.fn().mockResolvedValue({
    id: 'collab-1',
    status: 'PENDING_ORG_REVIEW',
    organization: { id: 'org-1', name: 'Acme Publishing' },
    authorBudget: 1000,
    currency: 'USD',
    turn: 'ORGANIZATION',
    attachments: [],
    rounds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
}));

function renderWithAuth(
  ui: ReactElement,
  options: {
    role?: UserRole | null;
    appType?: LoginAppType | null;
    initialEntries?: string[];
  } = {}
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      organizationAuthors: organizationAuthorsReducer,
      organizationMembers: organizationMembersReducer,
      collaborations: collaborationsReducer,
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
        linkedAuthors: [],
        invitations: [],
        loading: false,
        inviting: false,
        error: null,
      },
      organizationMembers: {
        organizationId: null,
        members: [],
        loading: false,
        saving: false,
        error: null,
      },
      collaborations: {
        organizationId: null,
        collaborations: [],
        loading: false,
        saving: false,
        actionLoadingId: null,
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
}

describe('Discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();
  });

  it('renders AuthorSearchPanel for organization context', () => {
    renderWithAuth(<Discovery />, {
      role: 'ORG_ADMIN',
      appType: 'organization',
    });

    expect(screen.getByTestId('author-search-panel')).toBeInTheDocument();
    expect(
      screen.queryByTestId('organization-search-panel')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Discovery' })).toBeInTheDocument();
  });

  it('renders OrganizationSearchPanel for author context', () => {
    renderWithAuth(<Discovery />, {
      role: 'AUTHOR',
      appType: 'author',
    });

    expect(
      screen.getByText(/discover organizations and request to connect/i)
    ).toBeInTheDocument();
  });
});

describe('OrganizationSearchPanel', () => {
  it('navigates to collaboration create from Request to join', async () => {
    const user = userEvent.setup();

    renderWithAuth(<OrganizationSearchPanel />, {
      role: 'AUTHOR',
      appType: 'author',
    });

    const button = await screen.findByRole('button', {
      name: /request to join acme publishing/i,
    });
    expect(button).toBeEnabled();

    await user.click(button);
    expect(navigateMock).toHaveBeenCalledWith(
      '/management/collaborations/create?organizationId=org-1&organizationName=Acme+Publishing'
    );
  });
});

describe('Management', () => {
  it('renders Team and Collaborations tabs for org context', async () => {
    renderWithAuth(<Management />, {
      role: 'ORG_ADMIN',
      appType: 'organization',
      initialEntries: ['/management?tab=team'],
    });

    expect(screen.getByRole('heading', { name: /^manage$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Team' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Collaborations' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assets' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/no team members yet/i)).toBeInTheDocument();
    });
  });

  it('hides Team tab for author context', () => {
    renderWithAuth(<Management />, {
      role: 'AUTHOR',
      appType: 'author',
      initialEntries: ['/management?tab=collaborations'],
    });

    expect(screen.queryByRole('button', { name: 'Team' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Collaborations' })
    ).toBeInTheDocument();
  });

  it('renders empty Assets section', async () => {
    const user = userEvent.setup();

    renderWithAuth(<Management />, {
      role: 'ORG_ADMIN',
      appType: 'organization',
      initialEntries: ['/management?tab=team'],
    });

    await user.click(screen.getByRole('button', { name: 'Assets' }));

    expect(
      screen.getByText(/no assets yet\. asset management will be available here/i)
    ).toBeInTheDocument();
  });
});
