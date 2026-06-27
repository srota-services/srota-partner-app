import type { AuthorInvitationForAuthor } from '../../../types/authorInvitation';
import { getOrganizationDisplayName } from '../../../utils/authorInvitationDisplay';
import {
  getInvitationStatusLabelForAuthor,
  getInvitationStatusVariant,
} from '../../../utils/authorInvitationStatus';
import InvitationStepActions from './InvitationStepActions';
import '../../../styles/pages/inbox/components/OrganizationInvitationTable.css';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';

interface OrganizationInvitationTableProps {
  invitations: AuthorInvitationForAuthor[];
  actionLoadingId: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function OrganizationInvitationTable({
  invitations,
  actionLoadingId,
}: OrganizationInvitationTableProps) {
  return (
    <div className="inbox-table-wrapper marketing-card">
      <div className="inbox-table-scroll">
        <table className="inbox-table audiobook-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map(invitation => {
              const variant = getInvitationStatusVariant(invitation.status);
              const isLoading = actionLoadingId === invitation.id;

              return (
                <tr key={invitation.id} className="inbox-table-row">
                  <td>
                    <p className="audiobook-table-title">
                      {getOrganizationDisplayName(invitation.organization)}
                    </p>
                  </td>
                  <td>
                    <span
                      className={`audiobook-status-badge audiobook-status-badge--${variant}`}
                    >
                      {getInvitationStatusLabelForAuthor(invitation.status)}
                    </span>
                  </td>
                  <td>
                    <span className="inbox-table-cell">
                      {formatDate(invitation.createdAt)}
                    </span>
                  </td>
                  <td className="inbox-table-actions-cell">
                    <InvitationStepActions
                      invitation={invitation}
                      isLoading={isLoading}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrganizationInvitationTable;
