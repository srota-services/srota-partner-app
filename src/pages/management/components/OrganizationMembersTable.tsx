import React from 'react';
import type { OrganizationMemberDto } from '../../../types/partner';
import type { OrganizationMemberRole } from '../../../utils/organizationMemberApi';
import '../../../styles/pages/management/components/AuthorsTable.css';

interface OrganizationMembersTableProps {
  members: OrganizationMemberDto[];
  canManage: boolean;
  saving: boolean;
  onChangeRole: (userId: string, role: OrganizationMemberRole) => void;
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
  canManage,
  saving,
  onChangeRole,
  onRemove,
}) => {
  return (
    <div className="authors-table-wrapper">
      <table className="authors-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Role</th>
            <th>Joined</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id}>
              <td>{member.userId}</td>
              <td>
                {canManage ? (
                  <select
                    value={member.role}
                    disabled={saving}
                    onChange={event =>
                      onChangeRole(
                        member.userId,
                        event.target.value as OrganizationMemberRole
                      )
                    }
                  >
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  member.role
                )}
              </td>
              <td>{formatDate(member.joinedAt)}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizationMembersTable;
