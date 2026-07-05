import type { AuthorInvitationForAuthor } from '../../../types/authorInvitation';
import { getOrganizationDisplayName } from '../../../utils/authorInvitationDisplay';
import {
  getInvitationStatusLabelForAuthor,
  getInvitationStatusVariant,
} from '../../../utils/authorInvitationStatus';
import '../../../styles/pages/inbox/components/OrganizationInvitationTable.css';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';

interface AuthorInvitationHistoryTableProps {
  invitations: AuthorInvitationForAuthor[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function AuthorInvitationHistoryTable({
  invitations,
}: AuthorInvitationHistoryTableProps) {
  return (
    <div className="inbox-table-wrapper marketing-card">
      <div className="inbox-table-scroll">
        <table className="inbox-table audiobook-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map(invitation => {
              const variant = getInvitationStatusVariant(invitation.status);

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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuthorInvitationHistoryTable;
