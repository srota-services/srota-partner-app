import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PartnerType, TeamSize } from '../../types/partner';

export type RegistrationStep = 1 | 2 | 3 | 4;

export interface OrganizationAccountData {
  email: string;
  password: string;
  address: string;
  contact: string;
  acceptedTerms: boolean;
}

export interface OrganizationProfileData {
  organizationName: string;
  websiteUrl: string;
  teamSize: TeamSize | null;
  preferredGenre: string | null;
  image: File | null;
}

export interface IndividualDetailsData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contact: string;
  image: File | null;
}

export interface IndividualPasswordData {
  password: string;
  acceptedTerms: boolean;
}

interface PartnerRegistrationState {
  partnerType: PartnerType | null;
  step: RegistrationStep;
  organizationAccount: OrganizationAccountData;
  organizationProfile: OrganizationProfileData;
  individualDetails: IndividualDetailsData;
  individualPassword: IndividualPasswordData;
  registeredEmail: string;
  userProfileId: string;
  isOtpVerified: boolean;
  isRegistering: boolean;
}

const emptyOrganizationAccount: OrganizationAccountData = {
  email: '',
  password: '',
  address: '',
  contact: '',
  acceptedTerms: false,
};

const emptyOrganizationProfile: OrganizationProfileData = {
  organizationName: '',
  websiteUrl: '',
  teamSize: null,
  preferredGenre: null,
  image: null,
};

const emptyIndividualDetails: IndividualDetailsData = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  contact: '',
  image: null,
};

const emptyIndividualPassword: IndividualPasswordData = {
  password: '',
  acceptedTerms: false,
};

const initialState: PartnerRegistrationState = {
  partnerType: null,
  step: 1,
  organizationAccount: emptyOrganizationAccount,
  organizationProfile: emptyOrganizationProfile,
  individualDetails: emptyIndividualDetails,
  individualPassword: emptyIndividualPassword,
  registeredEmail: '',
  userProfileId: '',
  isOtpVerified: false,
  isRegistering: false,
};

export { initialState as partnerRegistrationInitialState };
export type { PartnerRegistrationState };

const partnerRegistrationSlice = createSlice({
  name: 'partnerRegistration',
  initialState,
  reducers: {
    setPartnerType: (state, action: PayloadAction<PartnerType>) => {
      state.partnerType = action.payload;
    },
    setStep: (state, action: PayloadAction<RegistrationStep>) => {
      state.step = action.payload;
    },
    setOrganizationAccount: (
      state,
      action: PayloadAction<OrganizationAccountData>
    ) => {
      state.organizationAccount = action.payload;
    },
    setOrganizationProfile: (
      state,
      action: PayloadAction<OrganizationProfileData>
    ) => {
      state.organizationProfile = action.payload;
    },
    setIndividualDetails: (
      state,
      action: PayloadAction<IndividualDetailsData>
    ) => {
      state.individualDetails = action.payload;
    },
    setIndividualPassword: (
      state,
      action: PayloadAction<IndividualPasswordData>
    ) => {
      state.individualPassword = action.payload;
    },
    setRegisteredEmail: (state, action: PayloadAction<string>) => {
      state.registeredEmail = action.payload;
    },
    setUserProfileId: (state, action: PayloadAction<string>) => {
      state.userProfileId = action.payload;
    },
    setIsOtpVerified: (state, action: PayloadAction<boolean>) => {
      state.isOtpVerified = action.payload;
    },
    setIsRegistering: (state, action: PayloadAction<boolean>) => {
      state.isRegistering = action.payload;
    },
    hydratePartnerRegistration: (
      _state,
      action: PayloadAction<PartnerRegistrationState>
    ) => ({
      ...action.payload,
      isRegistering: false,
    }),
    resetPartnerRegistration: () => initialState,
  },
});

export const {
  setPartnerType,
  setStep,
  setOrganizationAccount,
  setOrganizationProfile,
  setIndividualDetails,
  setIndividualPassword,
  setRegisteredEmail,
  setUserProfileId,
  setIsOtpVerified,
  setIsRegistering,
  hydratePartnerRegistration,
  resetPartnerRegistration,
} = partnerRegistrationSlice.actions;

export default partnerRegistrationSlice.reducer;
