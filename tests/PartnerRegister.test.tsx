import { describe, it, expect, vi, beforeEach } from 'vitest';

import { render, screen, waitFor, act } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { Provider } from 'react-redux';

import { MemoryRouter } from 'react-router-dom';

import { store } from '../src/store/store';

import { resetPartnerRegistration, setPartnerType, setStep, setRegisteredEmail, setIsOtpVerified, setIndividualDetails, setIndividualPassword } from '../src/store/slices/partnerRegistrationSlice';

import PartnerRegister from '../src/pages/partner/PartnerRegister';

import {

  completeIndividualProfileStep,

  completeIndividualSecurityStep,

  completeIndividualOtpStep,

} from './individualRegisterHelpers';



vi.mock('../src/utils/partnerApi', () => ({

  registerPartnerUser: vi.fn().mockResolvedValue('admin@acme.com'),

  registerIndividualPartner: vi.fn().mockResolvedValue('author@example.com'),

  fetchUserProfileWithRetry: vi.fn().mockResolvedValue({ id: 'profile-123' }),

  verifyRegistrationOtp: vi.fn().mockResolvedValue({ accessToken: 'access-token' }),

  resendOtp: vi.fn().mockResolvedValue({
    message: 'If the email exists, an OTP has been sent to your email',
  }),

  completePartnerOrganizationSetup: vi.fn().mockResolvedValue({
    id: 'org-1',
    name: 'Acme Audio',
    slug: 'acme-audio-abc123',
  }),

  storeAuthorSlugAfterRegistration: vi.fn().mockResolvedValue(undefined),

}));



vi.mock('../src/utils/authSession', () => ({

  endSessionAndRedirectToLogin: vi.fn().mockResolvedValue(undefined),

}));



function renderPartnerRegister() {

  return render(

    <Provider store={store}>

      <MemoryRouter>

        <PartnerRegister />

      </MemoryRouter>

    </Provider>

  );

}



async function completeOrganizationAccountStep(
  user: ReturnType<typeof userEvent.setup>,
  options?: { address?: string; contact?: string }
) {
  const address = options?.address ?? '123 Publisher Lane';
  const contact = options?.contact ?? '+1 555 0100';

  await user.click(screen.getByRole('button', { name: /organization/i }));

  await user.click(screen.getByRole('button', { name: /continue/i }));

  await user.type(screen.getByLabelText(/work email/i), 'admin@acme.com');

  await user.type(screen.getByLabelText(/^password$/i), 'Secure1pass!');

  await user.type(
    document.getElementById('adminConfirmPassword') as HTMLInputElement,
    'Secure1pass!'
  );

  await user.type(screen.getByLabelText(/^address/i), address);

  await user.type(screen.getByLabelText(/contact number/i), contact);

  await user.click(screen.getByRole('checkbox'));

  await user.click(screen.getByRole('button', { name: /continue/i }));

}



async function completeOrganizationOtpStep(user: ReturnType<typeof userEvent.setup>) {

  const digits = screen.getAllByLabelText(/digit \d+ of 6/i);

  for (let i = 0; i < 6; i++) {

    await user.type(digits[i], String(i + 1));

  }

  await user.click(screen.getByRole('button', { name: /verify & finish/i }));

}



async function reachOrganizationProfileStep(user: ReturnType<typeof userEvent.setup>) {

  await completeOrganizationAccountStep(user);

  await waitFor(() => {

    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();

  });

  await completeOrganizationOtpStep(user);

  await waitFor(() => {

    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();

  });

}



describe('PartnerRegister organization flow', () => {

  beforeEach(() => {

    vi.clearAllMocks();

    store.dispatch(resetPartnerRegistration());

    vi.stubGlobal('URL', {

      ...globalThis.URL,

      createObjectURL: vi.fn(() => 'blob:mock-preview'),

      revokeObjectURL: vi.fn(),

    });

  });



  it('keeps the marketing panel visible while changing steps', async () => {

    const user = userEvent.setup();

    renderPartnerRegister();



    expect(

      screen.getByRole('heading', {

        name: /start publishing with confidence/i,

      })

    ).toBeInTheDocument();



    await user.click(screen.getByRole('button', { name: /organization/i }));

    await user.click(screen.getByRole('button', { name: /continue/i }));



    expect(

      screen.getByRole('heading', {

        name: /start publishing with confidence/i,

      })

    ).toBeInTheDocument();

    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();

  });



  it('blocks account submit until address and contact are provided', async () => {

    const user = userEvent.setup();

    const { registerPartnerUser } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await user.click(screen.getByRole('button', { name: /organization/i }));

    await user.click(screen.getByRole('button', { name: /continue/i }));



    await user.type(screen.getByLabelText(/work email/i), 'admin@acme.com');

    await user.type(screen.getByLabelText(/^password$/i), 'Secure1pass!');

    await user.type(
    document.getElementById('adminConfirmPassword') as HTMLInputElement,
    'Secure1pass!'
  );

    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /continue/i }));



    expect(registerPartnerUser).not.toHaveBeenCalled();

    expect(

      screen.getByRole('button', { name: /please enter an address/i })

    ).toBeInTheDocument();

    expect(

      screen.getByRole('button', { name: /please enter a contact number/i })

    ).toBeInTheDocument();

  });



  it('blocks account submit when passwords do not match', async () => {

    const user = userEvent.setup();

    const { registerPartnerUser } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await user.click(screen.getByRole('button', { name: /organization/i }));

    await user.click(screen.getByRole('button', { name: /continue/i }));



    await user.type(screen.getByLabelText(/work email/i), 'admin@acme.com');

    await user.type(screen.getByLabelText(/^password$/i), 'Secure1pass!');

    await user.type(
      document.getElementById('adminConfirmPassword') as HTMLInputElement,
      'Different1pass'
    );

    await user.type(screen.getByLabelText(/^address/i), '123 Publisher Lane');

    await user.type(screen.getByLabelText(/contact number/i), '+1 555 0100');

    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /continue/i }));



    expect(registerPartnerUser).not.toHaveBeenCalled();

    expect(

      screen.getByRole('button', { name: /passwords do not match/i })

    ).toBeInTheDocument();

  });



  it('blocks account submit until terms are accepted', async () => {

    const user = userEvent.setup();

    const { registerPartnerUser } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await user.click(screen.getByRole('button', { name: /organization/i }));

    await user.click(screen.getByRole('button', { name: /continue/i }));



    await user.type(screen.getByLabelText(/work email/i), 'admin@acme.com');

    await user.type(screen.getByLabelText(/^password$/i), 'Secure1pass!');

    await user.type(
    document.getElementById('adminConfirmPassword') as HTMLInputElement,
    'Secure1pass!'
  );

    await user.type(screen.getByLabelText(/^address/i), '123 Publisher Lane');

    await user.type(screen.getByLabelText(/contact number/i), '+1 555 0100');

    await user.click(screen.getByRole('button', { name: /continue/i }));



    expect(registerPartnerUser).not.toHaveBeenCalled();

    expect(

      screen.queryByText(/must agree to the terms and privacy policy/i)

    ).not.toBeInTheDocument();



    const termsErrorButton = screen.getByRole('button', {

      name: /you must agree to the terms and privacy policy/i,

    });

    expect(termsErrorButton).toBeInTheDocument();



    await user.click(termsErrorButton);

    expect(screen.getByRole('tooltip')).toHaveTextContent(

      /you must agree to the terms and privacy policy/i

    );

  });



  it('calls register after account step and shows organization step after OTP', async () => {

    const user = userEvent.setup();

    const {

      registerPartnerUser,

      fetchUserProfileWithRetry,

      verifyRegistrationOtp,

    } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await completeOrganizationAccountStep(user);



    await waitFor(() => {

      expect(registerPartnerUser).toHaveBeenCalledWith({

        email: 'admin@acme.com',

        password: 'Secure1pass!',

        confirmPassword: 'Secure1pass!',

        role: 'ORG_ADMIN',

        address: '123 Publisher Lane',

        contact: '+1 555 0100',

      });

    });

    expect(fetchUserProfileWithRetry).not.toHaveBeenCalled();

    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();



    await completeOrganizationOtpStep(user);



    await waitFor(() => {

      expect(verifyRegistrationOtp).toHaveBeenCalledWith({

        email: 'admin@acme.com',

        otp: '123456',

        type: 'organization',

      });

    });



    await waitFor(() => {

      expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();

    });

    expect(fetchUserProfileWithRetry).not.toHaveBeenCalled();

  });



  it('requires team size and genre on organization step with field error icons', async () => {

    const user = userEvent.setup();

    const { registerPartnerUser } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await reachOrganizationProfileStep(user);



    await user.type(

      screen.getByLabelText(/organization name/i),

      'Acme Audio Publishers'

    );

    await user.click(screen.getByRole('button', { name: /continue/i }));



    expect(registerPartnerUser).toHaveBeenCalledTimes(1);

    expect(screen.queryByText(/please select a team size/i)).not.toBeInTheDocument();

    expect(screen.queryByText(/please select a primary genre/i)).not.toBeInTheDocument();



    expect(

      screen.getByRole('button', { name: /please select a team size/i })

    ).toBeInTheDocument();

    expect(

      screen.getByRole('button', { name: /please select a primary genre/i })

    ).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: 'Fantasy' })).toBeInTheDocument();

  });



  it('sends address and contact to register when provided on account step', async () => {

    const user = userEvent.setup();

    const { registerPartnerUser } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await completeOrganizationAccountStep(user, {

      address: '123 Publisher Lane',

      contact: '+1 555 0100',

    });



    await waitFor(() => {

      expect(registerPartnerUser).toHaveBeenCalledWith({

        email: 'admin@acme.com',

        password: 'Secure1pass!',

        confirmPassword: 'Secure1pass!',

        role: 'ORG_ADMIN',

        address: '123 Publisher Lane',

        contact: '+1 555 0100',

      });

    });

  });



  it('prefills account fields when navigating back from OTP step', async () => {

    const user = userEvent.setup();



    renderPartnerRegister();



    await completeOrganizationAccountStep(user, {

      address: '123 Publisher Lane',

      contact: '+1 555 0100',

    });



    await waitFor(() => {

      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();

    });



    await user.click(screen.getByRole('button', { name: /back/i }));



    expect(screen.getByLabelText(/work email/i)).toHaveValue('admin@acme.com');

    expect(screen.getByLabelText(/^password$/i)).toHaveValue('Secure1pass!');

    expect(screen.getByLabelText(/^address/i)).toHaveValue('123 Publisher Lane');

    expect(screen.getByLabelText(/contact number/i)).toHaveValue('+1 555 0100');

    expect(screen.getByRole('checkbox')).toBeChecked();

  });



  it('persists organization logo when navigating back from organization step', async () => {

    const user = userEvent.setup();

    const { container } = renderPartnerRegister();



    await reachOrganizationProfileStep(user);



    const logoFile = new File(['logo-bytes'], 'logo.png', { type: 'image/png' });

    const fileInput = container.querySelector(

      'input[type="file"]'

    ) as HTMLInputElement;

    await user.upload(fileInput, logoFile);



    await user.click(screen.getByRole('button', { name: /back/i }));



    expect(store.getState().partnerRegistration.organizationProfile.image).toBe(

      logoFile

    );



    await completeOrganizationOtpStep(user);



    expect(store.getState().partnerRegistration.organizationProfile.image).toBe(

      logoFile

    );

    expect(
      screen.getByRole('img', { name: /uploaded image preview/i })
    ).toBeInTheDocument();

  });



  it('does not call register again when returning to OTP step after registration', async () => {

    const user = userEvent.setup();

    const { registerPartnerUser } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await completeOrganizationAccountStep(user);



    await waitFor(() => {

      expect(registerPartnerUser).toHaveBeenCalledTimes(1);

    });

    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();



    await user.click(screen.getByRole('button', { name: /back/i }));

    await user.type(
      document.getElementById('adminConfirmPassword') as HTMLInputElement,
      'Secure1pass!'
    );

    await user.click(screen.getByRole('button', { name: /continue/i }));



    await waitFor(() => {

      expect(registerPartnerUser).toHaveBeenCalledTimes(1);

    });

    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();

  });



  it('skips OTP step when returning to account step after OTP is verified', async () => {

    const user = userEvent.setup();

    const { registerPartnerUser } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await reachOrganizationProfileStep(user);



    await user.click(screen.getByRole('button', { name: /back/i }));



    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();

    expect(screen.queryByText(/verify your email/i)).not.toBeInTheDocument();



    await user.type(screen.getByLabelText(/^address/i), '456 Updated Lane');

    await user.type(
      document.getElementById('adminConfirmPassword') as HTMLInputElement,
      'Secure1pass!'
    );

    await user.click(screen.getByRole('button', { name: /continue/i }));



    await waitFor(() => {
      expect(registerPartnerUser).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/verify your email/i)).not.toBeInTheDocument();

  });

});



describe('PartnerRegister individual flow', () => {

  beforeEach(() => {

    vi.clearAllMocks();

    store.dispatch(resetPartnerRegistration());

  });



  it('blocks profile submit until address and contact are provided', async () => {

    const user = userEvent.setup();



    renderPartnerRegister();



    await user.click(screen.getByRole('button', { name: /individual/i }));

    await user.click(screen.getByRole('button', { name: /continue/i }));

    await user.type(screen.getByLabelText(/first name/i), 'Jane');

    await user.type(screen.getByLabelText(/last name/i), 'Author');

    await user.type(screen.getByLabelText(/^email$/i), 'author@example.com');

    await user.click(screen.getByRole('button', { name: /continue/i }));



    expect(

      screen.getByRole('heading', { name: /create your personal profile/i })

    ).toBeInTheDocument();

    expect(document.getElementById('individualPassword')).not.toBeInTheDocument();

    expect(

      screen.getByRole('button', { name: /please enter an address/i })

    ).toBeInTheDocument();

    expect(

      screen.getByRole('button', { name: /please enter a contact number/i })

    ).toBeInTheDocument();

  });



  it('sends profileImage to register when provided on profile step', async () => {

    const user = userEvent.setup();

    const { registerIndividualPartner } = await import('../src/utils/partnerApi');

    const profileImage = new File(['photo'], 'profile.png', { type: 'image/png' });



    renderPartnerRegister();



    await completeIndividualProfileStep(user, { profileImage });

    await completeIndividualSecurityStep(user);



    await waitFor(() => {

      expect(registerIndividualPartner).toHaveBeenCalledWith({

        email: 'author@example.com',

        password: 'Secure1pass!',

        confirmPassword: 'Secure1pass!',

        firstName: 'Jane',

        lastName: 'Author',

        address: '456 Author Street',

        contact: '+1 555 0200',

        profileImage,

      });

    });

  });



  it('calls register on security step continue without fetching profile', async () => {

    const user = userEvent.setup();

    const {

      registerIndividualPartner,

      fetchUserProfileWithRetry,

      verifyRegistrationOtp,

      storeAuthorSlugAfterRegistration,

    } = await import('../src/utils/partnerApi');

    const { endSessionAndRedirectToLogin } = await import('../src/utils/authSession');



    renderPartnerRegister();



    await completeIndividualProfileStep(user);

    await completeIndividualSecurityStep(user);



    await waitFor(() => {

      expect(registerIndividualPartner).toHaveBeenCalledWith({

        email: 'author@example.com',

        password: 'Secure1pass!',

        confirmPassword: 'Secure1pass!',

        firstName: 'Jane',

        lastName: 'Author',

        address: '456 Author Street',

        contact: '+1 555 0200',

      });

    });

    expect(fetchUserProfileWithRetry).not.toHaveBeenCalled();

    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();



    await completeIndividualOtpStep(user);



    await waitFor(() => {

      expect(verifyRegistrationOtp).toHaveBeenCalledWith({

        email: 'author@example.com',

        otp: '123456',

        type: 'author',

      });

    });

    expect(fetchUserProfileWithRetry).not.toHaveBeenCalled();

    expect(storeAuthorSlugAfterRegistration).toHaveBeenCalled();

    expect(endSessionAndRedirectToLogin).toHaveBeenCalled();

  });



  it('calls resendOtp when resend code is clicked on OTP step', async () => {

    vi.useFakeTimers({ shouldAdvanceTime: true });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { resendOtp } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await completeIndividualProfileStep(user);

    await completeIndividualSecurityStep(user);



    await waitFor(() => {

      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();

    });



    for (let i = 0; i < 30; i += 1) {

      await act(async () => {

        vi.advanceTimersByTime(1000);

      });

    }



    await waitFor(() => {

      expect(

        screen.getByRole('button', { name: /^resend code$/i })

      ).toBeEnabled();

    });



    await user.click(screen.getByRole('button', { name: /^resend code$/i }));



    await waitFor(() => {

      expect(resendOtp).toHaveBeenCalledWith({

        email: 'author@example.com',

        purpose: 'REGISTRATION',

      });

    });



    vi.useRealTimers();

  });



  it('blocks security submit until terms are accepted', async () => {

    const user = userEvent.setup();

    const { registerIndividualPartner } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await completeIndividualProfileStep(user);



    await user.type(
      document.getElementById('individualPassword') as HTMLInputElement,
      'Secure1pass!'
    );
    await user.type(
      document.getElementById('individualConfirmPassword') as HTMLInputElement,
      'Secure1pass!'
    );
    await user.click(screen.getByRole('button', { name: /^continue$/i }));



    expect(registerIndividualPartner).not.toHaveBeenCalled();

    expect(

      screen.getByRole('button', {

        name: /you must agree to the terms and privacy policy/i,

      })

    ).toBeInTheDocument();

  });



  it('does not call register again when returning to security step after registration', async () => {

    const user = userEvent.setup();

    const { registerIndividualPartner } = await import('../src/utils/partnerApi');



    renderPartnerRegister();



    await completeIndividualProfileStep(user);

    await completeIndividualSecurityStep(user);



    await waitFor(() => {

      expect(registerIndividualPartner).toHaveBeenCalledTimes(1);

    });



    await user.click(screen.getByRole('button', { name: /back/i }));

    await user.click(screen.getByRole('button', { name: /continue/i }));



    await waitFor(() => {

      expect(registerIndividualPartner).toHaveBeenCalledTimes(1);

    });

  });



  it('skips OTP when continuing from security step after OTP is verified', async () => {

    const user = userEvent.setup();

    const { endSessionAndRedirectToLogin } = await import('../src/utils/authSession');



    store.dispatch(setPartnerType('individual'));

    store.dispatch(setRegisteredEmail('author@example.com'));

    store.dispatch(setIsOtpVerified(true));

    store.dispatch(

      setIndividualDetails({

        firstName: 'Jane',

        lastName: 'Author',

        email: 'author@example.com',

        address: '456 Author Street',

        contact: '+1 555 0200',

        image: null,

      })

    );

    store.dispatch(

      setIndividualPassword({

        password: 'Secure1pass!',

        acceptedTerms: true,

      })

    );

    store.dispatch(setStep(3));



    renderPartnerRegister();



    expect(

      screen.getByRole('heading', { name: /secure your account/i })

    ).toBeInTheDocument();



    await user.type(

      document.getElementById('individualConfirmPassword') as HTMLInputElement,

      'Secure1pass!'

    );

    await user.click(screen.getByRole('button', { name: /^continue$/i }));



    await waitFor(() => {

      expect(endSessionAndRedirectToLogin).toHaveBeenCalled();

    });

    expect(screen.queryByText(/verify your email/i)).not.toBeInTheDocument();

  });

});

