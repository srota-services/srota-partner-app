import { describe, it, expect } from 'vitest';
import {
  buildOrganizationFormData,
  buildOrganizationUpdateFormData,
} from '../src/utils/organizationFormData';

describe('buildOrganizationFormData', () => {
  it('includes required name field', () => {
    const formData = buildOrganizationFormData({
      organizationName: 'Acme Audio',
    });

    expect(formData.get('name')).toBe('Acme Audio');
  });

  it('includes optional organization fields when provided', () => {
    const image = new File(['logo'], 'logo.png', { type: 'image/png' });
    const formData = buildOrganizationFormData({
      organizationName: 'Acme Audio',
      websiteUrl: 'https://acme.example',
      teamSize: '11-50',
      preferredGenre: 'Fantasy',
      image,
    });

    expect(formData.get('websiteUrl')).toBe('https://acme.example');
    expect(formData.get('teamSize')).toBe('11-50');
    expect(formData.get('preferredGenre')).toBe('Fantasy');
    expect(formData.get('image')).toBe(image);
  });

  it('omits blank optional fields', () => {
    const formData = buildOrganizationFormData({
      organizationName: 'Acme Audio',
      websiteUrl: '   ',
    });

    expect(formData.get('websiteUrl')).toBeNull();
    expect(formData.get('teamSize')).toBeNull();
    expect(formData.get('preferredGenre')).toBeNull();
    expect(formData.get('image')).toBeNull();
  });
});

describe('buildOrganizationUpdateFormData', () => {
  it('appends only provided fields for partial updates', () => {
    const formData = buildOrganizationUpdateFormData({
      name: 'Updated Org',
    });

    expect(formData.get('name')).toBe('Updated Org');
    expect(formData.get('description')).toBeNull();
    expect(formData.get('websiteUrl')).toBeNull();
  });

  it('supports clearing optional string fields with empty values', () => {
    const formData = buildOrganizationUpdateFormData({
      websiteUrl: '',
      preferredGenre: null,
    });

    expect(formData.get('websiteUrl')).toBe('');
    expect(formData.get('preferredGenre')).toBe('');
  });

  it('serializes discoverable as a string boolean', () => {
    const enabled = buildOrganizationUpdateFormData({ discoverable: true });
    const disabled = buildOrganizationUpdateFormData({ discoverable: false });

    expect(enabled.get('discoverable')).toBe('true');
    expect(disabled.get('discoverable')).toBe('false');
  });

  it('includes image when provided', () => {
    const image = new File(['logo'], 'logo.png', { type: 'image/png' });
    const formData = buildOrganizationUpdateFormData({ image });

    expect(formData.get('image')).toBe(image);
  });
});

describe('settingsSection helpers', () => {
  it('returns organization and user sections for organization app type', async () => {
    const { getVisibleSettingsSections, resolveSettingsSection } =
      await import('../src/pages/settings/settingsSection');

    const sections = getVisibleSettingsSections('organization');
    expect(sections.map(section => section.id)).toEqual([
      'organization',
      'user',
    ]);
    expect(sections.map(section => section.label)).toEqual([
      'Organization Profile Settings',
      'User Profile Settings',
    ]);
    expect(resolveSettingsSection('user', sections)).toBe('user');
    expect(resolveSettingsSection('invalid', sections)).toBe('organization');
  });

  it('returns only author section for author app type', async () => {
    const { getVisibleSettingsSections, resolveSettingsSection } =
      await import('../src/pages/settings/settingsSection');

    const sections = getVisibleSettingsSections('author');
    expect(sections.map(section => section.id)).toEqual(['author']);
    expect(resolveSettingsSection('organization', sections)).toBe('author');
    expect(resolveSettingsSection('user', sections)).toBe('author');
  });
});
