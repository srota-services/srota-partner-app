import type { PartnerType, TeamSize } from '../types/partner';
import type {
  IndividualDetailsData,
  IndividualPasswordData,
  OrganizationAccountData,
  OrganizationProfileData,
  PartnerRegistrationState,
  RegistrationStep,
} from '../store/slices/partnerRegistrationSlice';
import { partnerRegistrationInitialState } from '../store/slices/partnerRegistrationSlice';

const STORAGE_KEY = 'srota_partner_registration_draft';
const STORAGE_VERSION = 1;

interface PersistedImage {
  name: string;
  type: string;
  dataUrl: string;
}

interface PersistedPartnerRegistrationDraft {
  version: number;
  partnerType: PartnerType | null;
  step: RegistrationStep;
  organizationAccount: OrganizationAccountData;
  organizationProfile: Omit<OrganizationProfileData, 'image'> & {
    image: PersistedImage | null;
  };
  individualDetails: Omit<IndividualDetailsData, 'image'> & {
    image: PersistedImage | null;
  };
  individualPassword: IndividualPasswordData;
  registeredEmail: string;
  userProfileId: string;
  isOtpVerified: boolean;
}

function isRegistrationStep(value: unknown): value is RegistrationStep {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function isPartnerType(value: unknown): value is PartnerType {
  return value === 'organization' || value === 'individual';
}

function isTeamSize(value: unknown): value is TeamSize {
  return value === '1-10' || value === '11-50' || value === '51-200' || value === '200+';
}

async function fileToPersistedImage(file: File): Promise<PersistedImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read image file'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    type: file.type,
    dataUrl,
  };
}

function persistedImageToFile(image: PersistedImage): File {
  const [header = '', base64 = ''] = image.dataUrl.split(',');
  const mime =
    image.type || header.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], image.name, { type: mime });
}

function isPersistedImage(value: unknown): value is PersistedImage {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as PersistedImage;
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.dataUrl === 'string' &&
    candidate.dataUrl.startsWith('data:')
  );
}

export function isPartnerRegistrationDraftEmpty(
  state: PartnerRegistrationState
): boolean {
  return state.step === 1 && state.partnerType === null;
}

async function serializePartnerRegistration(
  state: PartnerRegistrationState
): Promise<PersistedPartnerRegistrationDraft> {
  const organizationImage = state.organizationProfile.image
    ? await fileToPersistedImage(state.organizationProfile.image)
    : null;
  const individualImage = state.individualDetails.image
    ? await fileToPersistedImage(state.individualDetails.image)
    : null;

  return {
    version: STORAGE_VERSION,
    partnerType: state.partnerType,
    step: state.step,
    organizationAccount: state.organizationAccount,
    organizationProfile: {
      ...state.organizationProfile,
      image: organizationImage,
    },
    individualDetails: {
      ...state.individualDetails,
      image: individualImage,
    },
    individualPassword: state.individualPassword,
    registeredEmail: state.registeredEmail,
    userProfileId: state.userProfileId,
    isOtpVerified: state.isOtpVerified,
  };
}

function deserializePartnerRegistration(
  draft: PersistedPartnerRegistrationDraft
): PartnerRegistrationState {
  return {
    ...partnerRegistrationInitialState,
    partnerType: draft.partnerType,
    step: draft.step,
    organizationAccount: draft.organizationAccount,
    organizationProfile: {
      ...draft.organizationProfile,
      image: draft.organizationProfile.image
        ? persistedImageToFile(draft.organizationProfile.image)
        : null,
    },
    individualDetails: {
      ...draft.individualDetails,
      image: draft.individualDetails.image
        ? persistedImageToFile(draft.individualDetails.image)
        : null,
    },
    individualPassword: draft.individualPassword,
    registeredEmail: draft.registeredEmail,
    userProfileId: draft.userProfileId,
    isOtpVerified: draft.isOtpVerified,
    isRegistering: false,
  };
}

function isPersistedDraft(value: unknown): value is PersistedPartnerRegistrationDraft {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const draft = value as PersistedPartnerRegistrationDraft;
  if (draft.version !== STORAGE_VERSION) {
    return false;
  }
  if (draft.partnerType !== null && !isPartnerType(draft.partnerType)) {
    return false;
  }
  if (!isRegistrationStep(draft.step)) {
    return false;
  }
  if (typeof draft.registeredEmail !== 'string') {
    return false;
  }
  if (typeof draft.userProfileId !== 'string') {
    return false;
  }
  if (typeof draft.isOtpVerified !== 'boolean') {
    return false;
  }
  if (!draft.organizationAccount || typeof draft.organizationAccount !== 'object') {
    return false;
  }
  if (!draft.organizationProfile || typeof draft.organizationProfile !== 'object') {
    return false;
  }
  if (!draft.individualDetails || typeof draft.individualDetails !== 'object') {
    return false;
  }
  if (!draft.individualPassword || typeof draft.individualPassword !== 'object') {
    return false;
  }
  if (
    draft.organizationProfile.teamSize !== null &&
    !isTeamSize(draft.organizationProfile.teamSize)
  ) {
    return false;
  }
  if (
    draft.organizationProfile.image !== null &&
    !isPersistedImage(draft.organizationProfile.image)
  ) {
    return false;
  }
  if (
    draft.individualDetails.image !== null &&
    !isPersistedImage(draft.individualDetails.image)
  ) {
    return false;
  }

  return true;
}

export function clearPartnerRegistrationDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures (private browsing, etc.)
  }
}

export async function persistPartnerRegistrationDraft(
  state: PartnerRegistrationState
): Promise<void> {
  if (isPartnerRegistrationDraftEmpty(state)) {
    clearPartnerRegistrationDraft();
    return;
  }

  try {
    const draft = await serializePartnerRegistration(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage failures (private browsing, quota exceeded, etc.)
  }
}

export function loadPartnerRegistrationDraft(): PartnerRegistrationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedDraft(parsed)) {
      clearPartnerRegistrationDraft();
      return null;
    }

    if (parsed.partnerType === null) {
      clearPartnerRegistrationDraft();
      return null;
    }

    return deserializePartnerRegistration(parsed);
  } catch {
    clearPartnerRegistrationDraft();
    return null;
  }
}
