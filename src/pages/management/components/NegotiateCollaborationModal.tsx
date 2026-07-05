import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface NegotiateCollaborationModalProps {
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (organizationAsk: number) => void;
}

const NegotiateCollaborationModal: React.FC<NegotiateCollaborationModalProps> = ({
  isOpen,
  saving,
  onClose,
  onSubmit,
}) => {
  const [organizationAsk, setOrganizationAsk] = useState('');

  const handleClose = () => {
    setOrganizationAsk('');
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const ask = Number(organizationAsk);
    if (Number.isNaN(ask) || ask <= 0) {
      return;
    }
    onSubmit(ask);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Negotiate budget">
      <form className="manage-form" onSubmit={handleSubmit}>
        <label className="manage-form-field">
          <span>Organization ask</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={organizationAsk}
            onChange={event => setOrganizationAsk(event.target.value)}
            required
          />
        </label>
        <div className="manage-form-actions">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Submitting...' : 'Send counter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NegotiateCollaborationModal;
