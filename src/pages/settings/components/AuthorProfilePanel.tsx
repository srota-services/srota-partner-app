import { useCallback, useEffect, useState } from 'react';
import ImageUploadZone from '../../../components/common/ImageUploadZone';
import InfoBanner from '../../../components/common/InfoBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import PillSwitch from '../../../components/common/PillSwitch';
import type { ApiError, AuthorProfileDto } from '../../../types/partner';
import {
  getMyAuthorProfile,
  updateMyAuthorProfile,
} from '../../../utils/partnerApi';
import { showApiError, showSuccess } from '../../../utils/toast';
import SettingsFieldRow from './SettingsFieldRow';

function AuthorProfilePanel() {
  const [author, setAuthor] = useState<AuthorProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [discoverable, setDiscoverable] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingDiscoverable, setSavingDiscoverable] = useState(false);

  const loadAuthor = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const profile = await getMyAuthorProfile();
      setAuthor(profile);
      setDiscoverable(profile.discoverable ?? false);
      setPendingAvatar(null);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.statusCode === 404) {
        setAuthor(null);
        setNotFound(true);
      } else {
        showApiError(error);
        setAuthor(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAuthor();
  }, [loadAuthor]);

  const handleSaveAvatar = async () => {
    if (!pendingAvatar) {
      return;
    }

    setSavingAvatar(true);
    try {
      const updated = await updateMyAuthorProfile({
        profileImage: pendingAvatar,
      });
      setAuthor(updated);
      setPendingAvatar(null);
      showSuccess('Author avatar updated');
    } catch (error) {
      showApiError(error);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleDiscoverableChange = async (checked: boolean) => {
    const previous = discoverable;
    setDiscoverable(checked);
    setSavingDiscoverable(true);
    try {
      const updated = await updateMyAuthorProfile({ discoverable: checked });
      setAuthor(updated);
      showSuccess('Discoverability updated');
    } catch (error) {
      setDiscoverable(previous);
      showApiError(error);
    } finally {
      setSavingDiscoverable(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-panel-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="settings-panel">
        <div className="settings-panel-header">
          <h2 className="settings-panel-title">Author Profile Settings</h2>
        </div>
        <InfoBanner>
          No author profile linked to this account.
        </InfoBanner>
      </div>
    );
  }

  if (!author) {
    return (
      <InfoBanner>
        Unable to load author profile. Please try again later.
      </InfoBanner>
    );
  }

  const fieldsDisabled = savingAvatar || savingDiscoverable;

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h2 className="settings-panel-title">Author Profile Settings</h2>
        <p className="settings-panel-subtitle">
          Manage your author avatar and marketplace visibility.
        </p>
      </div>

      <div className="settings-fields">
        <SettingsFieldRow
          label="Avatar"
          hint="Upload a profile image for your author identity."
          showSave
          canSave={pendingAvatar !== null}
          isSaving={savingAvatar}
          onSave={() => void handleSaveAvatar()}
        >
          <ImageUploadZone
            value={pendingAvatar}
            onChange={setPendingAvatar}
            previewUrl={author.avatar}
            disabled={fieldsDisabled}
            ariaLabel="Upload author avatar"
            recommendedSizeHint="512×512"
            variant="avatar"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Discoverable"
          hint="When enabled, organizations will be able to discover your profile."
        >
          <div className="settings-toggle-row">
            <PillSwitch
              checked={discoverable}
              onChange={checked => void handleDiscoverableChange(checked)}
              label="Discoverable"
              hideLabel
              disabled={fieldsDisabled}
            />
          </div>
        </SettingsFieldRow>
      </div>
    </div>
  );
}

export default AuthorProfilePanel;
