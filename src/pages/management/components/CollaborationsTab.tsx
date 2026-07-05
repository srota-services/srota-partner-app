import React from 'react';
import { useAppSelector } from '../../../hooks/redux';
import {
  isAuthorMarketplaceContext,
  isOrgMarketplaceContext,
} from '../../../utils/marketplaceContext';
import OrgCollaborationsPanel from './OrgCollaborationsPanel';
import AuthorCollaborationsPanel from './AuthorCollaborationsPanel';

const CollaborationsTab: React.FC = () => {
  const { role, appType } = useAppSelector(state => state.auth);
  const showOrgPanel = isOrgMarketplaceContext(appType, role);
  const showAuthorPanel = isAuthorMarketplaceContext(appType, role);

  if (showOrgPanel) {
    return <OrgCollaborationsPanel />;
  }

  if (showAuthorPanel) {
    return <AuthorCollaborationsPanel />;
  }

  return (
    <div className="team-placeholder marketing-card">
      <p>Collaborations are not available for your account type.</p>
    </div>
  );
};

export default CollaborationsTab;
