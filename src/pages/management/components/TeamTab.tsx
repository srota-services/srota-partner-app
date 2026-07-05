import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useMemberUserProfiles } from '../../../hooks/useMemberUserProfiles';
import {
  addMember,
  fetchOrganizationMembers,
  removeMember,
} from '../../../store/slices/organizationMembersSlice';
import { isOrgStaffRole } from '../../../utils/authRole';
import {
  formatMemberContact,
  formatMemberEmail,
  formatMemberName,
} from '../../../utils/organizationMemberDisplay';
import SearchBar from '../../../components/common/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import AddMemberModal from './AddMemberModal';
import OrganizationMembersTable from './OrganizationMembersTable';
import { showApiError, showSuccess } from '../../../utils/toast';
import type { OrganizationMemberRole } from '../../../utils/organizationMemberApi';
import '../../../styles/pages/audiobooks/Audiobooks.css';

const TeamTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { role } = useAppSelector(state => state.auth);
  const { members, loading, saving } = useAppSelector(
    state => state.organizationMembers
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const canManage = role === 'ORG_ADMIN';

  useEffect(() => {
    dispatch(fetchOrganizationMembers()).catch(showApiError);
  }, [dispatch]);

  const memberUserIds = useMemo(
    () => members.map(member => member.userId),
    [members]
  );
  const avatarsByUserId = useMemberUserProfiles(memberUserIds);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return members;
    }
    return members.filter(member => {
      const searchable = [
        member.userId,
        formatMemberName(member),
        formatMemberEmail(member),
        formatMemberContact(member),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [members, searchQuery]);

  const handleAddMember = useCallback(
    async (input: { userId: string; role: OrganizationMemberRole }) => {
      try {
        await dispatch(addMember(input)).unwrap();
        showSuccess('Team member added');
        setIsAddModalOpen(false);
      } catch (error) {
        showApiError(error);
      }
    },
    [dispatch]
  );

  const handleConfirmRemove = useCallback(async () => {
    if (!memberToRemove) {
      return;
    }
    try {
      await dispatch(removeMember(memberToRemove)).unwrap();
      showSuccess('Team member removed');
      setMemberToRemove(null);
    } catch (error) {
      showApiError(error);
    }
  }, [dispatch, memberToRemove]);

  if (!isOrgStaffRole(role)) {
    return (
      <div className="team-placeholder marketing-card">
        <p>Team management is available for organization accounts.</p>
      </div>
    );
  }

  return (
    <div className="manage-tab-content">
      <div className="authors-filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, or contact..."
          className="authors-search"
        />
        {canManage && (
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            Add member
          </Button>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">
            {searchQuery ? 'No results found' : 'No team members yet'}
          </h3>
          <p className="empty-state-message">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Add organization staff members to collaborate on publishing.'}
          </p>
        </div>
      ) : (
        <OrganizationMembersTable
          members={filteredMembers}
          avatarsByUserId={avatarsByUserId}
          canManage={canManage}
          saving={saving}
          onRemove={setMemberToRemove}
        />
      )}

      <AddMemberModal
        isOpen={isAddModalOpen}
        saving={saving}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />

      <ConfirmDialog
        isOpen={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove team member"
        message="Are you sure you want to remove this member from the organization?"
        confirmText="Remove"
        isLoading={saving}
      />
    </div>
  );
};

export default TeamTab;
