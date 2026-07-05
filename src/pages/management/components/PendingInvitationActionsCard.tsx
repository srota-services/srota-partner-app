import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { AuthorInvitationForAuthor } from '../../../types/authorInvitation';
import { getPendingAuthorInvitations } from '../../../utils/authorInvitationPending';
import '../../../styles/pages/management/InvitationsPanel.css';

interface PendingInvitationActionsCardProps {
  invitations: AuthorInvitationForAuthor[];
}

function PendingInvitationActionsCard({
  invitations,
}: PendingInvitationActionsCardProps) {
  const navigate = useNavigate();
  const pendingInvitations = getPendingAuthorInvitations(invitations);

  if (pendingInvitations.length === 0) {
    return null;
  }

  const count = pendingInvitations.length;
  const oldestPending = pendingInvitations[0]!;
  const summary =
    count === 1
      ? '1 invitation needs your response'
      : `${count} invitations need your response`;

  const handleOpenWizard = () => {
    navigate(
      `/management/invitations/respond?invitationId=${oldestPending.id}`
    );
  };

  return (
    <button
      type="button"
      className="pending-invitation-actions-card marketing-card"
      onClick={handleOpenWizard}
      data-testid="pending-invitation-actions-card"
    >
      <div className="pending-invitation-actions-card-body">
        <p className="pending-invitation-actions-card-title">Pending actions</p>
        <p className="pending-invitation-actions-card-summary">{summary}</p>
      </div>
      <ChevronRight
        size={20}
        className="pending-invitation-actions-card-chevron"
        aria-hidden="true"
      />
    </button>
  );
}

export default PendingInvitationActionsCard;
