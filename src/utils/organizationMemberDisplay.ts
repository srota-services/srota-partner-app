import type { OrganizationMemberDto } from '../types/partner';

export function formatMemberName(member: OrganizationMemberDto): string {
  const firstName = member.user?.firstName?.trim();
  const lastName = member.user?.lastName?.trim();
  const parts = [firstName, lastName].filter(Boolean);

  return parts.length > 0 ? parts.join(' ') : '—';
}

export function formatMemberRole(role: string): string {
  switch (role) {
    case 'OWNER':
      return 'Owner';
    case 'ADMIN':
      return 'Admin';
    default:
      return role;
  }
}

export function getMemberInitials(member: OrganizationMemberDto): string {
  const name = formatMemberName(member);
  if (name !== '—') {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]?.charAt(0) ?? ''}${parts[1]?.charAt(0) ?? ''}`.toUpperCase();
    }
    if (parts[0]) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }

  const email = member.user?.email?.trim();
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return '—';
}

export function formatMemberContact(member: OrganizationMemberDto): string {
  return member.user?.contact?.trim() || '—';
}

export function formatMemberEmail(member: OrganizationMemberDto): string {
  return member.user?.email?.trim() || '—';
}
