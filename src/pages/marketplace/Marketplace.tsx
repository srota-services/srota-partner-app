import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import AuthorSearchPanel from './components/AuthorSearchPanel';
import OrganizationSearchPanel from './components/OrganizationSearchPanel';
import {
  isAuthorMarketplaceContext,
  isOrgMarketplaceContext,
} from '../../utils/marketplaceContext';
import '../../styles/pages/management/Management.css';
import '../../styles/pages/marketplace/Marketplace.css';

const Discovery: React.FC = () => {
  const { role, appType } = useAppSelector(state => state.auth);
  const showAuthorPanel = isOrgMarketplaceContext(appType, role);
  const showOrganizationPanel = isAuthorMarketplaceContext(appType, role);

  return (
    <div className="marketplace-page">
      <div className="management-header">
        <h1 className="page-title">Discovery</h1>
        <p className="page-subtitle">
          {showAuthorPanel
            ? 'Discover and invite authors to your organization.'
            : showOrganizationPanel
              ? 'Discover organizations on the platform.'
              : 'Discover partners on the platform.'}
        </p>
      </div>

      {showAuthorPanel && <AuthorSearchPanel />}
      {showOrganizationPanel && !showAuthorPanel && (
        <OrganizationSearchPanel />
      )}
      {!showAuthorPanel && !showOrganizationPanel && (
        <p className="marketplace-unavailable">
          Discovery is not available for your account type.
        </p>
      )}
    </div>
  );
};

export default Discovery;
