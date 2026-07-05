import React, { useState } from 'react';
import type { AuthorInvitationForAuthor } from '../../../../types/authorInvitation';
import { getOrganizationDisplayName } from '../../../../utils/authorInvitationDisplay';
import Button from '../../../../components/common/Button';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import '../../../../styles/pages/inbox/components/InvitationStepActions.css';

interface InvitationContactConsentStepProps {
  invitation: AuthorInvitationForAuthor;
  isLoading: boolean;
  onReveal: (reveal: boolean) => Promise<void>;
  layout?: 'inline' | 'wizard';
}

const InvitationContactConsentStep: React.FC<InvitationContactConsentStepProps> = ({
  invitation,
  isLoading,
  onReveal,
  layout = 'inline',
}) => {
  const orgName = getOrganizationDisplayName(invitation.organization);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  return (
    <>
      <div
        className={`invitation-step-actions${
          layout === 'wizard' ? ' invitation-step-actions--wizard' : ''
        }`}
      >
        <p className="invitation-step-copy">
          <strong>{orgName}</strong> has invited you to join their organization.
          Would you like to share your email and contact information so they can
          reach you?
        </p>
        <div className="invitation-step-buttons">
          <Button
            variant="primary"
            size={layout === 'wizard' ? 'medium' : 'small'}
            disabled={isLoading}
            onClick={() => onReveal(true)}
          >
            Share contact info
          </Button>
          <Button
            variant="danger"
            size={layout === 'wizard' ? 'medium' : 'small'}
            disabled={isLoading}
            onClick={() => setShowDeclineDialog(true)}
          >
            Decline invitation
          </Button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeclineDialog}
        onClose={() => setShowDeclineDialog(false)}
        onConfirm={async () => {
          await onReveal(false);
          setShowDeclineDialog(false);
        }}
        title="Decline invitation"
        message={`Declining will automatically reject the invitation from ${orgName}. This cannot be undone.`}
        confirmText="Decline"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
};

export default InvitationContactConsentStep;
