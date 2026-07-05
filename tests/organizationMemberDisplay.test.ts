import { describe, expect, it } from 'vitest';
import type { OrganizationMemberDto } from '../src/types/partner';
import {
  formatMemberContact,
  formatMemberEmail,
  formatMemberName,
  formatMemberRole,
} from '../src/utils/organizationMemberDisplay';

function createMember(
  overrides: Partial<OrganizationMemberDto> = {}
): OrganizationMemberDto {
  return {
    id: 'member-1',
    userId: 'user-1',
    organizationId: 'org-1',
    role: 'ADMIN',
    joinedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('organizationMemberDisplay', () => {
  it('formats member name from first and last name', () => {
    expect(
      formatMemberName(
        createMember({
          user: {
            email: 'jane@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
            contact: '+15551234567',
          },
        })
      )
    ).toBe('Jane Doe');
  });

  it('shows dash when both names are missing', () => {
    expect(
      formatMemberName(
        createMember({
          user: {
            email: 'jane@example.com',
            firstName: null,
            lastName: null,
          },
        })
      )
    ).toBe('—');
  });

  it('formats email, contact, and role', () => {
    const member = createMember({
      role: 'OWNER',
      user: {
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        contact: null,
      },
    });

    expect(formatMemberEmail(member)).toBe('owner@example.com');
    expect(formatMemberContact(member)).toBe('—');
    expect(formatMemberRole(member.role)).toBe('Owner');
  });
});
