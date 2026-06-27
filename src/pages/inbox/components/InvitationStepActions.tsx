import React, { useState } from 'react';
import { useAppDispatch } from '../../../hooks/redux';
import type { AuthorInvitationForAuthor } from '../../../types/authorInvitation';
import {
  revealContactThunk,
  confirmContactThunk,
  decideJoinThunk,
} from '../../../store/slices/authorInboxSlice';
import { getOrganizationDisplayName } from '../../../utils/authorInvitationDisplay';
import Button from '../../../components/common/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { showApiError, showSuccess } from '../../../utils/toast';
import '../../../styles/pages/inbox/components/InvitationStepActions.css';

interface InvitationStepActionsProps {
  invitation: AuthorInvitationForAuthor;
  isLoading: boolean;
}

const InvitationStepActions: React.FC<InvitationStepActionsProps> = ({
  invitation,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const orgName = getOrganizationDisplayName(invitation.organization);

  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'decline-reveal' | 'decline-join';
  } | null>(null);

  const handleReveal = async (reveal: boolean) => {
    try {
      const result = await dispatch(
        revealContactThunk({ invitationId: invitation.id, reveal })
      ).unwrap();
      showSuccess(result.message);
    } catch (error) {
      showApiError(error);
    }
  };

  const handleConfirmContact = async (contacted: boolean) => {
    try {
      const result = await dispatch(
        confirmContactThunk({ invitationId: invitation.id, contacted })
      ).unwrap();
      showSuccess(result.message);
    } catch (error) {
      showApiError(error);
    }
  };

  const handleJoin = async (accept: boolean) => {
    try {
      const result = await dispatch(
        decideJoinThunk({ invitationId: invitation.id, accept })
      ).unwrap();
      showSuccess(result.message);
    } catch (error) {
      showApiError(error);
    }
  };

  switch (invitation.status) {
    case 'PENDING_CONTACT_CONSENT':
      return (
        <>
          <div className="invitation-step-actions">
            <p className="invitation-step-copy">
              <strong>{orgName}</strong> has invited you to join their
              organization. Would you like to share your email and contact
              information so they can reach you?
            </p>
            <div className="invitation-step-buttons">
              <Button
                variant="primary"
                size="small"
                disabled={isLoading}
                onClick={() => handleReveal(true)}
              >
                Share contact info
              </Button>
              <Button
                variant="danger"
                size="small"
                disabled={isLoading}
                onClick={() => setConfirmDialog({ type: 'decline-reveal' })}
              >
                Decline invitation
              </Button>
            </div>
          </div>
          <ConfirmDialog
            isOpen={confirmDialog?.type === 'decline-reveal'}
            onClose={() => setConfirmDialog(null)}
            onConfirm={async () => {
              await handleReveal(false);
              setConfirmDialog(null);
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

    case 'AWAITING_ORG_CONTACT':
      return (
        <div className="invitation-step-actions">
          <p className="invitation-step-copy">
            You shared your contact details with <strong>{orgName}</strong>.
            Has the organization contacted you?
          </p>
          <div className="invitation-step-buttons">
            <Button
              variant="primary"
              size="small"
              disabled={isLoading}
              onClick={() => handleConfirmContact(true)}
            >
              Yes, they contacted me
            </Button>
            <Button
              variant="outline"
              size="small"
              disabled={isLoading}
              onClick={() => handleConfirmContact(false)}
            >
              Not yet
            </Button>
          </div>
        </div>
      );

    case 'AWAITING_JOIN_DECISION':
      return (
        <>
          <div className="invitation-step-actions">
            <p className="invitation-step-copy">
              Would you like to join <strong>{orgName}</strong>?
            </p>
            <div className="invitation-step-buttons">
              <Button
                variant="primary"
                size="small"
                disabled={isLoading}
                onClick={() => handleJoin(true)}
              >
                Accept & join
              </Button>
              <Button
                variant="danger"
                size="small"
                disabled={isLoading}
                onClick={() => setConfirmDialog({ type: 'decline-join' })}
              >
                Decline
              </Button>
            </div>
          </div>
          <ConfirmDialog
            isOpen={confirmDialog?.type === 'decline-join'}
            onClose={() => setConfirmDialog(null)}
            onConfirm={async () => {
              await handleJoin(false);
              setConfirmDialog(null);
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

    case 'DECLINED':
      return (
        <p className="invitation-step-copy invitation-step-copy--muted">
          You declined this invitation from {orgName}.
        </p>
      );

    case 'ACCEPTED':
      return (
        <p className="invitation-step-copy invitation-step-copy--success">
          You have joined {orgName}.
        </p>
      );

    default:
      return null;
  }
};

export default InvitationStepActions;
