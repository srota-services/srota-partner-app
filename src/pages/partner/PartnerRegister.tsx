import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowRight } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';

import {

  registerPartnerUser,

  registerIndividualPartner,

  verifyRegistrationOtp,

  completePartnerOrganizationSetup,

  storeAuthorSlugAfterRegistration,

} from '../../utils/partnerApi';

import { endSessionAndRedirectToLogin } from '../../utils/authSession';

import { showApiError } from '../../utils/toast';

import type { PartnerType } from '../../types/partner';

import {

  resetPartnerRegistration,

  setIndividualDetails,

  setIndividualPassword,

  setOrganizationAccount,

  setOrganizationProfile,

  setPartnerType,

  setRegisteredEmail,

  setUserProfileId,

  setIsOtpVerified,

  setStep,

} from '../../store/slices/partnerRegistrationSlice';

import { ORGANIZATION_GENRE_OPTIONS } from '../../content/marketingContent';

import Logo from '../../components/common/Logo';

import PartnerRegisterMarketingPanel from './components/PartnerRegisterMarketingPanel';

import PartnerWizardStepper from './components/PartnerWizardStepper';

import SelectPartnerTypeStep from './components/SelectPartnerTypeStep';

import RegisterUserStep, {

  type RegisterUserFormData,

} from './components/RegisterUserStep';

import RegisterIndividualDetailsStep, {

  type RegisterIndividualDetailsData,

} from './components/RegisterIndividualDetailsStep';

import RegisterIndividualPasswordStep, {

  type RegisterIndividualPasswordData,

} from './components/RegisterIndividualPasswordStep';

import VerifyOtpStep, {

  type VerifyOtpFormData,

} from './components/VerifyOtpStep';

import RegisterOrganizationStep, {

  type RegisterOrganizationFormData,

} from './components/RegisterOrganizationStep';

import '../../styles/shared/marketing.css';

import '../../styles/pages/partner/PartnerRegister.css';



const ORG_ADMIN_ROLE = 'ORG_ADMIN';



function PartnerRegister() {

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const {

    partnerType,

    step,

    organizationAccount,

    organizationProfile,

    individualDetails,

    individualPassword,

    registeredEmail,

    isOtpVerified,

  } = useAppSelector(state => state.partnerRegistration);

  const [isLoading, setIsLoading] = useState(false);



  useEffect(() => {

    const html = document.documentElement;

    const { body } = document;

    const prevHtmlOverflow = html.style.overflow;

    const prevBodyOverflow = body.style.overflow;



    html.style.overflow = 'hidden';

    body.style.overflow = 'hidden';



    return () => {

      html.style.overflow = prevHtmlOverflow;

      body.style.overflow = prevBodyOverflow;

    };

  }, []);



  const organizationLogoPreview = useMemo(() => {

    if (!organizationProfile.image) {

      return null;

    }

    return URL.createObjectURL(organizationProfile.image);

  }, [organizationProfile.image]);



  useEffect(() => {

    return () => {

      if (organizationLogoPreview) {

        URL.revokeObjectURL(organizationLogoPreview);

      }

    };

  }, [organizationLogoPreview]);



  const individualPhotoPreview = useMemo(() => {

    if (!individualDetails.image) {

      return null;

    }

    return URL.createObjectURL(individualDetails.image);

  }, [individualDetails.image]);



  useEffect(() => {

    return () => {

      if (individualPhotoPreview) {

        URL.revokeObjectURL(individualPhotoPreview);

      }

    };

  }, [individualPhotoPreview]);



  const resetToPartnerTypeSelection = () => {

    dispatch(resetPartnerRegistration());

  };



  const handleSelectPartnerType = (type: PartnerType) => {

    dispatch(setPartnerType(type));

    dispatch(setStep(2));

  };



  const handleOrganizationAccountSubmit = async (data: RegisterUserFormData) => {

    dispatch(

      setOrganizationAccount({

        email: data.email,

        password: data.password,

        address: data.address,

        contact: data.contact,

        acceptedTerms: data.acceptedTerms,

      })

    );



    if (registeredEmail) {
      dispatch(setStep(isOtpVerified ? 4 : 3));
      return;
    }



    setIsLoading(true);

    try {

      const email = await registerPartnerUser({

        email: data.email,

        password: data.password,

        confirmPassword: data.confirmPassword,

        role: ORG_ADMIN_ROLE,

        address: data.address || undefined,

        contact: data.contact || undefined,

      });

      dispatch(setRegisteredEmail(email));

      dispatch(setStep(3));

    } catch (err) {

      showApiError(err);

    } finally {

      setIsLoading(false);

    }

  };



  const resolvePreferredGenreLabel = (genreValue: string): string => {
    const match = ORGANIZATION_GENRE_OPTIONS.find(
      option => option.value === genreValue
    );
    return match?.label ?? genreValue;
  };



  const handleOrganizationProfileSubmit = async (

    data: RegisterOrganizationFormData

  ) => {

    const preferredGenre = resolvePreferredGenreLabel(data.preferredGenre);

    dispatch(

      setOrganizationProfile({

        organizationName: data.organizationName,

        websiteUrl: data.websiteUrl,

        teamSize: data.teamSize,

        preferredGenre,

        image: data.image,

      })

    );



    setIsLoading(true);

    try {

      await completePartnerOrganizationSetup({

        organizationName: data.organizationName,

        websiteUrl: data.websiteUrl || undefined,

        teamSize: data.teamSize,

        preferredGenre,

        image: data.image ?? undefined,

      });

      await endSessionAndRedirectToLogin(dispatch, navigate);

      dispatch(resetPartnerRegistration());

    } catch (err) {

      showApiError(err);

    } finally {

      setIsLoading(false);

    }

  };



  const handleIndividualDetailsSubmit = (

    data: RegisterIndividualDetailsData

  ) => {

    dispatch(setIndividualDetails(data));

    dispatch(setStep(3));

  };



  const handleIndividualPasswordSubmit = async (

    data: RegisterIndividualPasswordData

  ) => {

    dispatch(setIndividualPassword(data));

    if (registeredEmail && isOtpVerified) {
      setIsLoading(true);
      try {
        await storeAuthorSlugAfterRegistration();
        await endSessionAndRedirectToLogin(
          dispatch,
          navigate,
          'Registration complete. Please sign in.'
        );
        dispatch(resetPartnerRegistration());
      } catch (err) {
        showApiError(err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (registeredEmail) {
      dispatch(setStep(4));
      return;
    }



    setIsLoading(true);

    try {

      const email = await registerIndividualPartner({

        email: individualDetails.email,

        password: data.password,

        confirmPassword: data.confirmPassword,

        firstName: individualDetails.firstName,

        lastName: individualDetails.lastName,

        address: individualDetails.address,

        contact: individualDetails.contact || undefined,

        profileImage: individualDetails.image ?? undefined,

      });

      dispatch(setRegisteredEmail(email));

      dispatch(setStep(4));

    } catch (err) {

      showApiError(err);

    } finally {

      setIsLoading(false);

    }

  };



  const handleIndividualPasswordSaveDraft = (

    data: RegisterIndividualPasswordData

  ) => {

    dispatch(setIndividualPassword(data));

  };



  const handleVerifyOtp = async (data: VerifyOtpFormData) => {

    setIsLoading(true);

    try {

      if (partnerType === 'organization' && isOtpVerified) {

        dispatch(setStep(4));

        return;

      }



      if (partnerType === 'individual' && isOtpVerified) {

        await endSessionAndRedirectToLogin(

          dispatch,

          navigate,

          'Registration complete. Please sign in.'

        );

        dispatch(resetPartnerRegistration());

        return;

      }



      await verifyRegistrationOtp({

        email: registeredEmail,

        otp: data.otp,

        type: partnerType === 'individual' ? 'author' : 'organization',

      });



      if (partnerType === 'individual') {

        dispatch(setIsOtpVerified(true));

        await storeAuthorSlugAfterRegistration();

        await endSessionAndRedirectToLogin(

          dispatch,

          navigate,

          'Registration complete. Please sign in.'

        );

        dispatch(resetPartnerRegistration());

        return;

      }



      dispatch(setIsOtpVerified(true));

      dispatch(setStep(4));

    } catch (err) {

      showApiError(err);

    } finally {

      setIsLoading(false);

    }

  };



  const handleEditEmail = () => {

    dispatch(setRegisteredEmail(''));

    dispatch(setUserProfileId(''));

    dispatch(setIsOtpVerified(false));

    dispatch(setStep(2));

  };



  const combinedLoading = isLoading;

  const displayStep =

    partnerType === 'individual' && step > 1 ? step - 1 : step;

  const totalSteps = partnerType === 'individual' ? 3 : 4;

  const individualFullName = `${individualDetails.firstName} ${individualDetails.lastName}`.trim();



  return (

    <div className="partner-register-page">

      <header className="partner-register-header">

        <Logo to="/" />

        <div className="partner-register-header-auth">

          <span className="partner-register-header-prompt">

            Already a Partner?

          </span>

          <button

            type="button"

            className="partner-register-signin-btn"

            onClick={() => navigate('/login')}

          >

            Sign in

            <ArrowRight size={16} />

          </button>

        </div>

      </header>



      <div className="partner-register-body">

        <PartnerRegisterMarketingPanel partnerType={partnerType} />



        <section

          className={`partner-register-wizard${

            step === 4 && partnerType === 'organization'

              ? ' partner-register-wizard--organization'

              : ''

          }`}

        >

          <div

            className={`partner-register-card marketing-card${

              step === 4 && partnerType === 'organization'

                ? ' partner-register-card--organization'

                : ''

            }`}

          >

            <div className="partner-register-card-header">

              <h1 className="partner-register-title">Become a Partner</h1>

              {step > 1 && (

                <span className="partner-register-step-label">

                  <span className="partner-register-step-highlight">

                    Step {displayStep}

                  </span>{' '}

                  of {totalSteps}

                </span>

              )}

            </div>



            <PartnerWizardStepper step={step} partnerType={partnerType} />



            {step === 1 && (

              <SelectPartnerTypeStep

                isLoading={combinedLoading}

                initialType={partnerType}

                onContinue={handleSelectPartnerType}

              />

            )}



            {step === 2 && partnerType === 'organization' && (

              <RegisterUserStep

                isLoading={combinedLoading}

                initialData={organizationAccount}

                onSubmit={handleOrganizationAccountSubmit}

                onBack={resetToPartnerTypeSelection}

              />

            )}



            {step === 2 && partnerType === 'individual' && (

              <RegisterIndividualDetailsStep

                isLoading={combinedLoading}

                initialData={individualDetails}

                onSubmit={handleIndividualDetailsSubmit}

                onBack={draft => {

                  dispatch(setIndividualDetails(draft));

                  dispatch(setStep(1));

                }}

              />

            )}



            {step === 3 && partnerType === 'organization' && (

              <VerifyOtpStep

                email={registeredEmail}

                isLoading={combinedLoading}

                variant="organization"

                onVerify={handleVerifyOtp}

                onBack={() => dispatch(setStep(2))}

                onEditEmail={handleEditEmail}

              />

            )}



            {step === 3 && partnerType === 'individual' && (

              <RegisterIndividualPasswordStep

                isLoading={combinedLoading}

                initialData={individualPassword}

                onSubmit={handleIndividualPasswordSubmit}

                onSaveDraft={handleIndividualPasswordSaveDraft}

                onBack={() => dispatch(setStep(2))}

              />

            )}



            {step === 4 && partnerType === 'organization' && (

              <RegisterOrganizationStep

                isLoading={combinedLoading}

                initialData={organizationProfile}

                onSubmit={handleOrganizationProfileSubmit}

                onBack={draft => {
                  dispatch(setOrganizationProfile(draft));
                  dispatch(setStep(isOtpVerified ? 2 : 3));
                }}

              />

            )}



            {step === 4 && partnerType === 'individual' && (

              <VerifyOtpStep

                email={registeredEmail || individualDetails.email}

                isLoading={combinedLoading}

                variant="individual"

                fullName={individualFullName}

                photoPreviewUrl={individualPhotoPreview}

                onVerify={handleVerifyOtp}

                onBack={() => dispatch(setStep(3))}

                onEditEmail={handleEditEmail}

              />

            )}

          </div>

        </section>

      </div>

    </div>

  );

}



export default PartnerRegister;

