import type { AuthorInvitationForOrg } from '../../../types/authorInvitation';
import { getInvitationAuthorName } from '../../../utils/authorInvitationDisplay';
import {
  getInvitationStatusLabelForOrg,
  getInvitationStatusVariant,
  getOrgInvitationGuidance,
} from '../../../utils/authorInvitationStatus';
import '../../../styles/pages/management/components/AuthorsTable.css';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';

interface AuthorInvitationsTableProps {
  invitations: AuthorInvitationForOrg[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function AuthorInvitationsTable({ invitations }: AuthorInvitationsTableProps) {
  return (
    <div className="authors-table-wrapper marketing-card">
      <div className="authors-table-scroll">
        <table className="authors-table audiobook-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Status</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Sent</th>
              <th>Guidance</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map(invitation => {
              const variant = getInvitationStatusVariant(invitation.status);
              const showContact =
                invitation.status === 'AWAITING_ORG_CONTACT' ||
                invitation.status === 'AWAITING_JOIN_DECISION' ||
                invitation.status === 'ACCEPTED';

              return (
                <tr key={invitation.id} className="authors-table-row">
                  <td>
                    <p className="audiobook-table-title">
                      {getInvitationAuthorName(invitation.author)}
                    </p>
                  </td>
                  <td>
                    <span
                      className={`audiobook-status-badge audiobook-status-badge--${variant}`}
                    >
                      {getInvitationStatusLabelForOrg(invitation.status)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {showContact && invitation.author.email
                        ? invitation.author.email
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {showContact && invitation.author.contact
                        ? invitation.author.contact
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {formatDate(invitation.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-guidance">
                      {getOrgInvitationGuidance(invitation.status)}
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

export default AuthorInvitationsTable;
