import React from 'react';
import type { AuthorInvitationForAuthor } from '../../../../types/authorInvitation';
import { getOrganizationDisplayName } from '../../../../utils/authorInvitationDisplay';
import Button from '../../../../components/common/Button';
import '../../../../styles/pages/inbox/components/InvitationStepActions.css';

interface InvitationOrgContactStepProps {
  invitation: AuthorInvitationForAuthor;
  isLoading: boolean;
  onConfirmContact: (contacted: boolean) => Promise<void>;
  layout?: 'inline' | 'wizard';
}

const InvitationOrgContactStep: React.FC<InvitationOrgContactStepProps> = ({
  invitation,
  isLoading,
  onConfirmContact,
  layout = 'inline',
}) => {
  const orgName = getOrganizationDisplayName(invitation.organization);

  return (
    <div
      className={`invitation-step-actions${
        layout === 'wizard' ? ' invitation-step-actions--wizard' : ''
      }`}
    >
      <p className="invitation-step-copy">
        You shared your contact details with <strong>{orgName}</strong>. Has the
        organization contacted you?
      </p>
      <div className="invitation-step-buttons">
        <Button
          variant="primary"
          size={layout === 'wizard' ? 'medium' : 'small'}
          disabled={isLoading}
          onClick={() => onConfirmContact(true)}
        >
          Yes, they contacted me
        </Button>
        <Button
          variant="outline"
          size={layout === 'wizard' ? 'medium' : 'small'}
          disabled={isLoading}
          onClick={() => onConfirmContact(false)}
        >
          Not yet
        </Button>
      </div>
    </div>
  );
};

export default InvitationOrgContactStep;
