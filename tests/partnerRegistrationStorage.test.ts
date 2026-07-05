import { describe, expect, it, beforeEach, vi } from 'vitest';
import { partnerRegistrationInitialState } from '../src/store/slices/partnerRegistrationSlice';
import {
  clearPartnerRegistrationDraft,
  isPartnerRegistrationDraftEmpty,
  loadPartnerRegistrationDraft,
  persistPartnerRegistrationDraft,
} from '../src/utils/partnerRegistrationStorage';

const STORAGE_KEY = 'srota_partner_registration_draft';

describe('partnerRegistrationStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('treats step 1 with no partner type as empty', () => {
    expect(isPartnerRegistrationDraftEmpty(partnerRegistrationInitialState)).toBe(true);
  });

  it('persists and restores registration progress', async () => {
    const state = {
      ...partnerRegistrationInitialState,
      partnerType: 'organization' as const,
      step: 3 as const,
      organizationAccount: {
        email: 'admin@acme.com',
        password: 'Secure1pass!',
        address: '123 Publisher Lane',
        contact: '+1 555 0100',
        acceptedTerms: true,
      },
      registeredEmail: 'admin@acme.com',
      isOtpVerified: false,
    };

    await persistPartnerRegistrationDraft(state);

    const restored = loadPartnerRegistrationDraft();
    expect(restored).toEqual(state);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('persists uploaded organization logo as a File', async () => {
    const logoFile = new File(['logo-bytes'], 'logo.png', { type: 'image/png' });
    const state = {
      ...partnerRegistrationInitialState,
      partnerType: 'organization' as const,
      step: 4 as const,
      organizationProfile: {
        ...partnerRegistrationInitialState.organizationProfile,
        organizationName: 'Acme Audio',
        image: logoFile,
      },
      registeredEmail: 'admin@acme.com',
      isOtpVerified: true,
    };

    await persistPartnerRegistrationDraft(state);

    const restored = loadPartnerRegistrationDraft();
    expect(restored?.organizationProfile.image).toBeInstanceOf(File);
    expect(restored?.organizationProfile.image?.name).toBe('logo.png');
    expect(restored?.organizationProfile.image?.type).toBe('image/png');
  });

  it('clears persisted draft when registration is reset to the initial step', async () => {
    await persistPartnerRegistrationDraft({
      ...partnerRegistrationInitialState,
      partnerType: 'individual',
      step: 2,
      individualDetails: {
        ...partnerRegistrationInitialState.individualDetails,
        firstName: 'Jane',
        lastName: 'Author',
        email: 'author@example.com',
      },
    });

    await persistPartnerRegistrationDraft(partnerRegistrationInitialState);

    expect(loadPartnerRegistrationDraft()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clears invalid persisted drafts', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999 }));
    expect(loadPartnerRegistrationDraft()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clearPartnerRegistrationDraft removes saved state', async () => {
    await persistPartnerRegistrationDraft({
      ...partnerRegistrationInitialState,
      partnerType: 'organization',
      step: 2,
      organizationAccount: {
        ...partnerRegistrationInitialState.organizationAccount,
        email: 'admin@acme.com',
      },
    });

    clearPartnerRegistrationDraft();
    expect(loadPartnerRegistrationDraft()).toBeNull();
  });
});

describe('partnerRegistrationStorage FileReader failures', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('ignores persist failures when image serialization fails', async () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function mockRead(
      this: FileReader
    ) {
      this.onerror?.(new ProgressEvent('error'));
    });

    await persistPartnerRegistrationDraft({
      ...partnerRegistrationInitialState,
      partnerType: 'organization',
      step: 4,
      organizationProfile: {
        ...partnerRegistrationInitialState.organizationProfile,
        organizationName: 'Acme Audio',
        image: new File(['logo-bytes'], 'logo.png', { type: 'image/png' }),
      },
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
