import { useCallback, useEffect, useState } from 'react';
import ImageUploadZone from '../../../components/common/ImageUploadZone';
import InfoBanner from '../../../components/common/InfoBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import PillSwitch from '../../../components/common/PillSwitch';
import { useSettingsOrganization } from '../../../hooks/useSettingsOrganization';
import type { OrganizationItem, TeamSize } from '../../../types/partner';
import { updateOrganization } from '../../../utils/partnerApi';
import { showApiError, showSuccess } from '../../../utils/toast';
import SettingsChoiceGroup from './SettingsChoiceGroup';
import {
  SETTINGS_GENRE_OPTIONS,
  SETTINGS_TEAM_SIZE_OPTIONS,
} from '../settingsChoiceOptions';
import SettingsFieldRow from './SettingsFieldRow';

type SavingField =
  | 'name'
  | 'description'
  | 'image'
  | 'preferredGenre'
  | 'websiteUrl'
  | 'teamSize'
  | 'discoverable'
  | null;

function syncOrganizationFields(organization: OrganizationItem) {
  return {
    name: organization.name ?? '',
    description: organization.description ?? '',
    websiteUrl: organization.websiteUrl ?? '',
    preferredGenre: organization.preferredGenre ?? null,
    teamSize: (organization.teamSize as TeamSize | null) ?? null,
    discoverable: organization.discoverable ?? false,
  };
}

function OrganizationProfilePanel() {
  const { organization, loading, canEdit, refresh } = useSettingsOrganization();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [preferredGenre, setPreferredGenre] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<TeamSize | null>(null);
  const [discoverable, setDiscoverable] = useState(false);
  const [savedValues, setSavedValues] = useState(() =>
    syncOrganizationFields({
      id: '',
      name: '',
      slug: '',
    })
  );
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [savingField, setSavingField] = useState<SavingField>(null);

  useEffect(() => {
    if (!organization) {
      return;
    }

    const synced = syncOrganizationFields(organization);
    setName(synced.name);
    setDescription(synced.description);
    setWebsiteUrl(synced.websiteUrl);
    setPreferredGenre(synced.preferredGenre);
    setTeamSize(synced.teamSize);
    setDiscoverable(synced.discoverable);
    setSavedValues(synced);
    setPendingImage(null);
  }, [organization]);

  const saveField = useCallback(
    async (
      field: Exclude<SavingField, null>,
      payload: Parameters<typeof updateOrganization>[1]
    ): Promise<boolean> => {
      if (!organization?.id || !canEdit) {
        return false;
      }

      setSavingField(field);
      try {
        const updated = await updateOrganization(organization.id, payload);
        const synced = syncOrganizationFields(updated);
        setSavedValues(synced);
        setName(synced.name);
        setDescription(synced.description);
        setWebsiteUrl(synced.websiteUrl);
        setPreferredGenre(synced.preferredGenre);
        setTeamSize(synced.teamSize);
        setDiscoverable(synced.discoverable);
        if (field === 'image') {
          setPendingImage(null);
        }
        showSuccess('Organization profile updated');
        await refresh();
        return true;
      } catch (error) {
        showApiError(error);
        return false;
      } finally {
        setSavingField(null);
      }
    },
    [canEdit, organization?.id, refresh]
  );

  const handleDiscoverableChange = async (checked: boolean) => {
    const previous = discoverable;
    setDiscoverable(checked);
    const saved = await saveField('discoverable', { discoverable: checked });
    if (!saved) {
      setDiscoverable(previous);
    }
  };

  if (loading) {
    return (
      <div className="settings-panel-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!organization) {
    return (
      <InfoBanner>
        Unable to load organization profile. Please try again later.
      </InfoBanner>
    );
  }

  const fieldsDisabled = !canEdit || savingField !== null;

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h2 className="settings-panel-title">Organization Profile Settings</h2>
        <p className="settings-panel-subtitle">
          Update how your organization appears across SROTA.
        </p>
      </div>

      {!canEdit && (
        <InfoBanner className="settings-readonly-banner">
          Only organization admins can edit these settings.
        </InfoBanner>
      )}

      <div className="settings-fields">
        <SettingsFieldRow
          label="Image"
          hint="Upload a logo for your organization."
          showSave
          canSave={canEdit && pendingImage !== null}
          isSaving={savingField === 'image'}
          onSave={() => {
            if (pendingImage) {
              void saveField('image', { image: pendingImage });
            }
          }}
        >
          <ImageUploadZone
            value={pendingImage}
            onChange={setPendingImage}
            previewUrl={organization.image}
            disabled={fieldsDisabled}
            ariaLabel="Upload organization logo"
            recommendedSizeHint="512×512"
            variant="avatar"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Name"
          hint="This is how your organization will appear on SROTA."
          showSave
          canSave={canEdit && name.trim() !== savedValues.name.trim()}
          isSaving={savingField === 'name'}
          onSave={() => void saveField('name', { name: name.trim() })}
        >
          <input
            type="text"
            className="settings-input"
            value={name}
            onChange={event => setName(event.target.value)}
            disabled={fieldsDisabled}
            placeholder="Organization name"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Description"
          hint="Briefly describe your organization for listeners and partners."
          showSave
          canSave={canEdit && description.trim() !== savedValues.description.trim()}
          isSaving={savingField === 'description'}
          onSave={() => void saveField('description', { description: description.trim() })}
        >
          <textarea
            className="settings-textarea"
            value={description}
            onChange={event => setDescription(event.target.value)}
            disabled={fieldsDisabled}
            placeholder="Organization description"
            rows={4}
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Preferred Genre"
          hint="Choose the genre that best represents your catalog."
          showSave
          canSave={canEdit && preferredGenre !== savedValues.preferredGenre}
          isSaving={savingField === 'preferredGenre'}
          onSave={() =>
            void saveField('preferredGenre', { preferredGenre })
          }
        >
          <SettingsChoiceGroup
            name="Preferred genre"
            options={SETTINGS_GENRE_OPTIONS}
            value={preferredGenre}
            onChange={setPreferredGenre}
            disabled={fieldsDisabled}
            columns={2}
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Website URL"
          hint="Add your website to help listeners learn more."
          showSave
          canSave={canEdit && websiteUrl.trim() !== savedValues.websiteUrl.trim()}
          isSaving={savingField === 'websiteUrl'}
          onSave={() => void saveField('websiteUrl', { websiteUrl: websiteUrl.trim() })}
        >
          <input
            type="url"
            className="settings-input"
            value={websiteUrl}
            onChange={event => setWebsiteUrl(event.target.value)}
            disabled={fieldsDisabled}
            placeholder="https://yourwebsite.com"
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Team Size"
          hint="Select the size of your organization."
          showSave
          canSave={canEdit && teamSize !== savedValues.teamSize}
          isSaving={savingField === 'teamSize'}
          onSave={() => void saveField('teamSize', { teamSize })}
        >
          <SettingsChoiceGroup
            name="Team size"
            options={SETTINGS_TEAM_SIZE_OPTIONS}
            value={teamSize}
            onChange={setTeamSize}
            disabled={fieldsDisabled}
            columns={4}
          />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Discoverable"
          hint="When enabled, authors will be able to discover your organization."
        >
          <div className="settings-toggle-row">
            <PillSwitch
              checked={discoverable}
              onChange={checked => void handleDiscoverableChange(checked)}
              label="Discoverable"
              hideLabel
              disabled={fieldsDisabled || savingField === 'discoverable'}
            />
          </div>
        </SettingsFieldRow>
      </div>
    </div>
  );
}

export default OrganizationProfilePanel;
