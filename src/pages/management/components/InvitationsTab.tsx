import React from 'react';
import { useAppSelector } from '../../../hooks/redux';
import {
  isAuthorMarketplaceContext,
  isOrgMarketplaceContext,
} from '../../../utils/marketplaceContext';
import OrgInvitationsPanel from './OrgInvitationsPanel';
import AuthorInvitationsPanel from './AuthorInvitationsPanel';

const InvitationsTab: React.FC = () => {
  const { role, appType } = useAppSelector(state => state.auth);
  const showOrgPanel = isOrgMarketplaceContext(appType, role);
  const showAuthorPanel = isAuthorMarketplaceContext(appType, role);

  if (showOrgPanel) {
    return <OrgInvitationsPanel />;
  }

  if (showAuthorPanel) {
    return <AuthorInvitationsPanel />;
  }

  return (
    <div className="team-placeholder marketing-card">
      <p>Invitations are not available for your account type.</p>
    </div>
  );
};

export default InvitationsTab;
