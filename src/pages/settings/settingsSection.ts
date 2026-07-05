import type { LoginAppType } from '../../types/auth';

export type SettingsSectionId = 'organization' | 'user' | 'author';

export interface SettingsSection {
  id: SettingsSectionId;
  label: string;
}

const ORGANIZATION_SECTION: SettingsSection = {
  id: 'organization',
  label: 'Organization Profile Settings',
};

const USER_SECTION: SettingsSection = {
  id: 'user',
  label: 'User Profile Settings',
};

const AUTHOR_SECTION: SettingsSection = {
  id: 'author',
  label: 'Author Profile Settings',
};

export function getVisibleSettingsSections(
  appType: LoginAppType | null
): SettingsSection[] {
  if (appType === 'organization') {
    return [ORGANIZATION_SECTION, USER_SECTION];
  }

  return [AUTHOR_SECTION];
}

export function resolveSettingsSection(
  requested: string | null,
  visibleSections: SettingsSection[]
): SettingsSectionId {
  const visibleIds = visibleSections.map(section => section.id);
  if (requested && visibleIds.includes(requested as SettingsSectionId)) {
    return requested as SettingsSectionId;
  }

  return visibleSections[0]?.id ?? 'author';
}

export function getSettingsSubtitle(appType: LoginAppType | null): string {
  if (appType === 'organization') {
    return 'Manage your organization and user profile settings.';
  }

  return 'Manage your author profile settings.';
}
