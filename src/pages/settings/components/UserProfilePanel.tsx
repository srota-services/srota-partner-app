import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import ImageUploadZone from '../../../components/common/ImageUploadZone';
import InfoBanner from '../../../components/common/InfoBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useUserProfileSettings } from '../../../hooks/useUserProfileSettings';
import type { UserProfile } from '../../../types/partner';
import {
  requestEmailUpdateOtp,
  updateEmail,
  updateUserProfile,
  verifyEmailUpdateOtp,
} from '../../../utils/partnerApi';
import { showApiError, showSuccess } from '../../../utils/toast';
import SettingsFieldRow from './SettingsFieldRow';

type SavingField =
  | 'avatar'
  | 'firstName'
  | 'lastName'
  | 'address'
  | 'contact'
  | 'email'
  | null;

function syncUserFields(profile: UserProfile) {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    address: profile.address ?? '',
    contact: profile.contact ?? '',
    email: profile.email ?? '',
  };
}

function UserProfilePanel() {
  const authUser = useAppSelector(state => state.auth.user);
  const { profile, loading, refresh } = useUserProfileSettings();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [savedValues, setSavedValues] = useState(() =>
    syncUserFields({ email: authUser?.email ?? '' })
  );
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [savingField, setSavingField] = useState<SavingField>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const synced = syncUserFields(profile);
    setFirstName(synced.firstName);
    setLastName(synced.lastName);
    setAddress(synced.address);
    setContact(synced.contact);
    setEmail(synced.email);
    setSavedValues(synced);
    setPendingAvatar(null);
    setEmailOtp('');
    setEmailOtpSent(false);
  }, [profile]);

  const saveProfileField = useCallback(
    async (
      field: Exclude<SavingField, 'email' | null>,
      payload: Parameters<typeof updateUserProfile>[0]
    ): Promise<boolean> => {
      setSavingField(field);
      try {
        const updated = await updateUserProfile(payload);
        const synced = syncUserFields(updated);
        setSavedValues(synced);
        setFirstName(synced.firstName);
        setLastName(synced.lastName);
        setAddress(synced.address);
        setContact(synced.contact);
        setEmail(synced.email);
        if (field === 'avatar') {
          setPendingAvatar(null);
        }
        showSuccess('Profile updated');
        await refresh();
        return true;
      } catch (error) {
        showApiError(error);
        return false;
      } finally {
        setSavingField(null);
      }
    },
    [refresh]
  );

  const handleSaveEmail = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || trimmedEmail === savedValues.email.trim()) {
      return;
    }

    setSavingField('email');
    try {
      if (!emailOtpSent) {
        await requestEmailUpdateOtp(savedValues.email);
        setEmailOtpSent(true);
        showSuccess('Verification code sent to your current email');
        return;
      }

      if (!emailOtp.trim()) {
        showApiError({ message: 'Enter the verification code from your email' });
        return;
      }

      await verifyEmailUpdateOtp(emailOtp.trim());
      await updateEmail(trimmedEmail);
      showSuccess('Email updated successfully');
      setEmailOtp('');
      setEmailOtpSent(false);
      await refresh();
    } catch (error) {
      showApiError(error);
    } finally {
      setSavingField(null);
    }
  };

  if (loading) {
    return (
      <div className="settings-panel-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <InfoBanner>
        Unable to load user profile. Please try again later.
      </InfoBanner>
    );
  }

  const avatarUrl = profile.avatar ?? profile.avatarUrl ?? null;
  const fieldsDisabled = savingField !== null;

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h2 className="settings-panel-title">User Profile Settings</h2>
        <p className="settings-panel-subtitle">
          Manage your personal account details.
        </p>
      </div>

      <div className="settings-fields">
        <SettingsFieldRow
          label="Avatar"
          hint="Upload a profile photo for your account."
          showSave
          canSave={pendingAvatar !== null}
          isSaving={savingField === 'avatar'}
          onSave={() => {
            if (pendingAvatar) {
              void saveProfileField('avatar', { avatar: pendingAvatar });
            }
          }}
        >
          <ImageUploadZone
            value={pendingAvatar}
            onChange={setPendingAvatar}
            previewUrl={avatarUrl}
            disabled={fieldsDisabled}
            ariaLabel="Upload user avatar"
            recommendedSizeHint="512×512"
            variant="avatar"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="First name"
          showSave
          canSave={firstName.trim() !== savedValues.firstName.trim()}
          isSaving={savingField === 'firstName'}
          onSave={() =>
            void saveProfileField('firstName', { firstName: firstName.trim() })
          }
        >
          <input
            type="text"
            className="settings-input"
            value={firstName}
            onChange={event => setFirstName(event.target.value)}
            disabled={fieldsDisabled}
            placeholder="First name"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Last name"
          showSave
          canSave={lastName.trim() !== savedValues.lastName.trim()}
          isSaving={savingField === 'lastName'}
          onSave={() =>
            void saveProfileField('lastName', { lastName: lastName.trim() })
          }
        >
          <input
            type="text"
            className="settings-input"
            value={lastName}
            onChange={event => setLastName(event.target.value)}
            disabled={fieldsDisabled}
            placeholder="Last name"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Address"
          showSave
          canSave={address.trim() !== savedValues.address.trim()}
          isSaving={savingField === 'address'}
          onSave={() =>
            void saveProfileField('address', {
              address: address.trim() || null,
            })
          }
        >
          <textarea
            className="settings-textarea"
            value={address}
            onChange={event => setAddress(event.target.value)}
            disabled={fieldsDisabled}
            placeholder="Address"
            rows={3}
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Contact"
          showSave
          canSave={contact.trim() !== savedValues.contact.trim()}
          isSaving={savingField === 'contact'}
          onSave={() =>
            void saveProfileField('contact', {
              contact: contact.trim() || null,
            })
          }
        >
          <input
            type="text"
            className="settings-input"
            value={contact}
            onChange={event => setContact(event.target.value)}
            disabled={fieldsDisabled}
            placeholder="Phone number"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Email"
          hint={
            emailOtpSent
              ? `Enter the verification code sent to ${savedValues.email}.`
              : 'Changing your email requires verification of your current address.'
          }
          showSave
          canSave={
            email.trim() !== savedValues.email.trim() &&
            (!emailOtpSent || emailOtp.trim().length > 0)
          }
          isSaving={savingField === 'email'}
          onSave={() => void handleSaveEmail()}
          saveLabel={emailOtpSent ? 'Verify & update' : 'Send code'}
        >
          <input
            type="email"
            className="settings-input"
            value={email}
            onChange={event => {
              setEmail(event.target.value);
              setEmailOtpSent(false);
              setEmailOtp('');
            }}
            disabled={fieldsDisabled}
            placeholder="Email address"
          />
          {emailOtpSent && (
            <input
              type="text"
              className="settings-input"
              value={emailOtp}
              onChange={event => setEmailOtp(event.target.value)}
              disabled={fieldsDisabled}
              placeholder="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          )}
        </SettingsFieldRow>
      </div>
    </div>
  );
}

export default UserProfilePanel;
