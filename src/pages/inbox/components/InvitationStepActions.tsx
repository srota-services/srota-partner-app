import React from 'react';
import { useAppDispatch } from '../../../hooks/redux';
import type { AuthorInvitationForAuthor } from '../../../types/authorInvitation';
import {
  revealContactThunk,
  confirmContactThunk,
  decideJoinThunk,
} from '../../../store/slices/authorInboxSlice';
import { getOrganizationDisplayName } from '../../../utils/authorInvitationDisplay';
import { showApiError, showSuccess } from '../../../utils/toast';
import InvitationContactConsentStep from '../../management/components/invitation-wizard/InvitationContactConsentStep';
import InvitationOrgContactStep from '../../management/components/invitation-wizard/InvitationOrgContactStep';
import InvitationJoinDecisionStep from '../../management/components/invitation-wizard/InvitationJoinDecisionStep';
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
        <InvitationContactConsentStep
          invitation={invitation}
          isLoading={isLoading}
          onReveal={handleReveal}
        />
      );

    case 'AWAITING_ORG_CONTACT':
      return (
        <InvitationOrgContactStep
          invitation={invitation}
          isLoading={isLoading}
          onConfirmContact={handleConfirmContact}
        />
      );

    case 'AWAITING_JOIN_DECISION':
      return (
        <InvitationJoinDecisionStep
          invitation={invitation}
          isLoading={isLoading}
          onJoin={handleJoin}
        />
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
