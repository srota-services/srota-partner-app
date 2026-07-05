import React, { useState } from 'react';
import type { AuthorInvitationForAuthor } from '../../../../types/authorInvitation';
import { getOrganizationDisplayName } from '../../../../utils/authorInvitationDisplay';
import Button from '../../../../components/common/Button';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import '../../../../styles/pages/inbox/components/InvitationStepActions.css';

interface InvitationJoinDecisionStepProps {
  invitation: AuthorInvitationForAuthor;
  isLoading: boolean;
  onJoin: (accept: boolean) => Promise<void>;
  layout?: 'inline' | 'wizard';
}

const InvitationJoinDecisionStep: React.FC<InvitationJoinDecisionStepProps> = ({
  invitation,
  isLoading,
  onJoin,
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
          Would you like to join <strong>{orgName}</strong>?
        </p>
        <div className="invitation-step-buttons">
          <Button
            variant="primary"
            size={layout === 'wizard' ? 'medium' : 'small'}
            disabled={isLoading}
            onClick={() => onJoin(true)}
          >
            Accept & join
          </Button>
          <Button
            variant="danger"
            size={layout === 'wizard' ? 'medium' : 'small'}
            disabled={isLoading}
            onClick={() => setShowDeclineDialog(true)}
          >
            Decline
          </Button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeclineDialog}
        onClose={() => setShowDeclineDialog(false)}
        onConfirm={async () => {
          await onJoin(false);
          setShowDeclineDialog(false);
        }}
        title="Decline to join"
        message={`Are you sure you do not want to join ${orgName}?`}
        confirmText="Decline"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
};

export default InvitationJoinDecisionStep;
