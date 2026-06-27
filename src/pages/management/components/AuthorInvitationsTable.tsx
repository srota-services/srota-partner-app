import type { AuthorInvitationForOrg } from '../../../types/authorInvitation';
import {
  formatInvitationDate,
  getInvitationAuthorName,
} from '../../../utils/authorInvitationDisplay';
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
              <th className="authors-table-col-sent">Sent</th>
              <th>Contact revealed</th>
              <th>Org contact confirmed</th>
              <th>User confirmation</th>
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
                  <td className="authors-table-col-sent">
                    <span className="authors-table-cell">
                      {formatInvitationDate(invitation.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {formatInvitationDate(invitation.contactRevealedAt)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {formatInvitationDate(invitation.orgContactConfirmedAt)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {formatInvitationDate(invitation.respondedAt)}
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
