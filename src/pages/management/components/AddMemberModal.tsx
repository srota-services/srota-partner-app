import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import type { OrganizationMemberRole } from '../../../utils/organizationMemberApi';

interface AddMemberModalProps {
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: { userId: string; role: OrganizationMemberRole }) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  saving,
  onClose,
  onSubmit,
}) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<OrganizationMemberRole>('ADMIN');

  const handleClose = () => {
    setUserId('');
    setRole('ADMIN');
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedUserId = userId.trim();
    if (!trimmedUserId) {
      return;
    }
    onSubmit({ userId: trimmedUserId, role });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add team member">
      <form className="manage-form" onSubmit={handleSubmit}>
        <label className="manage-form-field">
          <span>User ID</span>
          <input
            type="text"
            value={userId}
            onChange={event => setUserId(event.target.value)}
            placeholder="Enter user ID"
            required
          />
        </label>
        <label className="manage-form-field">
          <span>Role</span>
          <select
            value={role}
            onChange={event =>
              setRole(event.target.value as OrganizationMemberRole)
            }
          >
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
        </label>
        <div className="manage-form-actions">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Adding...' : 'Add member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
