import React from 'react';
import AppImage from '../../../components/common/AppImage';
import type { OrganizationMemberDto } from '../../../types/partner';
import {
  formatMemberContact,
  formatMemberEmail,
  formatMemberName,
  formatMemberRole,
} from '../../../utils/organizationMemberDisplay';
import '../../../styles/pages/management/components/AuthorsTable.css';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';

interface OrganizationMembersTableProps {
  members: OrganizationMemberDto[];
  avatarsByUserId: Record<string, string | null>;
  canManage: boolean;
  saving: boolean;
  onRemove: (userId: string) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}

const OrganizationMembersTable: React.FC<OrganizationMembersTableProps> = ({
  members,
  avatarsByUserId,
  canManage,
  saving,
  onRemove,
}) => {
  return (
    <div className="authors-table-wrapper marketing-card">
      <div className="authors-table-scroll">
        <table className="authors-table audiobook-table team-members-table">
          <colgroup>
            <col className="team-members-col team-members-col--avatar" />
            <col className="team-members-col team-members-col--member" />
            <col className="team-members-col team-members-col--email" />
            <col className="team-members-col team-members-col--contact" />
            <col className="team-members-col team-members-col--joined" />
            <col className="team-members-col team-members-col--role" />
            {canManage && <col className="team-members-col team-members-col--actions" />}
          </colgroup>
          <thead>
            <tr>
              <th className="team-members-avatar-header" aria-hidden="true" />
              <th>Member</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Joined</th>
              <th>Role</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              const avatarUrl = avatarsByUserId[member.userId] ?? null;

              return (
                <tr key={member.id} className="authors-table-row">
                  <td className="team-members-avatar-cell">
                    <AppImage
                      src={avatarUrl}
                      alt=""
                      variant="author"
                      className="team-member-avatar"
                    />
                  </td>
                  <td>
                    <span className="authors-table-cell team-member-name">
                      {formatMemberName(member)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {formatMemberEmail(member)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {formatMemberContact(member)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell">
                      {formatDate(member.joinedAt)}
                    </span>
                  </td>
                  <td>
                    <span className="authors-table-cell team-member-role">
                      {formatMemberRole(member.role)}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <button
                        type="button"
                        className="authors-table-action"
                        disabled={saving}
                        onClick={() => onRemove(member.userId)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationMembersTable;
