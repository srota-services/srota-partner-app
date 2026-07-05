import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { getSettingsReturnPath } from '../../utils/settingsReturnPath';
import AuthorProfilePanel from './components/AuthorProfilePanel';
import OrganizationProfilePanel from './components/OrganizationProfilePanel';
import SettingsSidebar from './components/SettingsSidebar';
import UserProfilePanel from './components/UserProfilePanel';
import {
  getSettingsSubtitle,
  getVisibleSettingsSections,
  resolveSettingsSection,
  type SettingsSectionId,
} from './settingsSection';
import '../../styles/pages/settings/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const appType = useAppSelector(state => state.auth.appType);
  const [searchParams, setSearchParams] = useSearchParams();

  const visibleSections = useMemo(
    () => getVisibleSettingsSections(appType),
    [appType]
  );

  const activeSection = useMemo(
    () => resolveSettingsSection(searchParams.get('section'), visibleSections),
    [searchParams, visibleSections]
  );

  useEffect(() => {
    const requested = searchParams.get('section');
    if (requested === activeSection) {
      return;
    }
    setSearchParams({ section: activeSection }, { replace: true });
  }, [activeSection, searchParams, setSearchParams]);

  const handleSectionChange = (sectionId: SettingsSectionId) => {
    setSearchParams({ section: sectionId });
  };

  const handleBack = () => {
    navigate(getSettingsReturnPath());
  };

  const renderActivePanel = () => {
    if (activeSection === 'organization') {
      return <OrganizationProfilePanel />;
    }

    if (activeSection === 'user') {
      return <UserProfilePanel />;
    }

    return <AuthorProfilePanel />;
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button
          type="button"
          className="settings-back-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">{getSettingsSubtitle(appType)}</p>
      </div>

      <div className="settings-layout">
        <SettingsSidebar
          sections={visibleSections}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <div className="settings-content">{renderActivePanel()}</div>
      </div>
    </div>
  );
}

export default Settings;
