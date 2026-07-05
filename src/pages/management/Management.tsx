/**
 * Manage page — team, collaborations, and assets
 */
import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { isOrgMarketplaceContext } from '../../utils/marketplaceContext';
import TeamTab from './components/TeamTab';
import InvitationsTab from './components/InvitationsTab';
import CollaborationsTab from './components/CollaborationsTab';
import '../../styles/pages/management/Management.css';
import '../../styles/pages/audiobooks/Audiobooks.css';

type ManageTabId = 'team' | 'invitations' | 'collaborations' | 'assets';

const ALL_TABS: { id: ManageTabId; label: string }[] = [
  { id: 'team', label: 'Team' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'collaborations', label: 'Collaborations' },
  { id: 'assets', label: 'Assets' },
];

const Management: React.FC = () => {
  const { role, appType } = useAppSelector(state => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const showTeamTab = isOrgMarketplaceContext(appType, role);

  const visibleTabs = useMemo(
    () =>
      ALL_TABS.filter(tab => (tab.id === 'team' ? showTeamTab : true)),
    [showTeamTab]
  );

  const activeTab = useMemo(() => {
    const requested = searchParams.get('tab') as ManageTabId | null;
    if (requested && visibleTabs.some(tab => tab.id === requested)) {
      return requested;
    }
    return showTeamTab ? 'team' : 'invitations';
  }, [searchParams, showTeamTab, visibleTabs]);

  useEffect(() => {
    const requested = searchParams.get('tab');
    if (requested === activeTab) {
      return;
    }
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);

  const handleTabChange = (tabId: ManageTabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="management-page">
      <div className="management-header">
        <h1 className="page-title">Manage</h1>
        <p className="page-subtitle">
          Manage your team, invitations, collaborations, and publishing assets.
        </p>
      </div>

      <div className="audiobooks-tabs authors-tabs">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`audiobooks-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'team' && <TeamTab />}
      {activeTab === 'invitations' && <InvitationsTab />}
      {activeTab === 'collaborations' && <CollaborationsTab />}
      {activeTab === 'assets' && (
        <section className="manage-assets-section marketing-card">
          <h2 className="manage-assets-heading">Assets</h2>
          <div className="manage-assets-empty">
            <p className="manage-assets-empty-message">
              No assets yet. Asset management will be available here.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Management;
