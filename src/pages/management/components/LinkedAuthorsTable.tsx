import type { OrganizationAuthorMember } from '../../../types/authorInvitation';
import { getInvitationAuthorName } from '../../../utils/authorInvitationDisplay';
import '../../../styles/pages/management/components/AuthorsTable.css';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';

interface LinkedAuthorsTableProps {
  authors: OrganizationAuthorMember[];
}

function LinkedAuthorsTable({ authors }: LinkedAuthorsTableProps) {
  return (
    <div className="authors-table-wrapper marketing-card">
      <div className="authors-table-scroll">
        <table className="authors-table audiobook-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {authors.map(author => (
              <tr key={author.id} className="authors-table-row">
                <td>
                  <p className="audiobook-table-title">
                    {getInvitationAuthorName(author)}
                  </p>
                </td>
                <td>
                  <span className="authors-table-cell">{author.email}</span>
                </td>
                <td>
                  <span className="authors-table-cell">
                    {author.contact || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LinkedAuthorsTable;
