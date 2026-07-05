import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface CounterBudgetModalProps {
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (authorBudget: number) => void;
}

const CounterBudgetModal: React.FC<CounterBudgetModalProps> = ({
  isOpen,
  saving,
  onClose,
  onSubmit,
}) => {
  const [authorBudget, setAuthorBudget] = useState('');

  const handleClose = () => {
    setAuthorBudget('');
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const budget = Number(authorBudget);
    if (Number.isNaN(budget) || budget <= 0) {
      return;
    }
    onSubmit(budget);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Counter budget">
      <form className="manage-form" onSubmit={handleSubmit}>
        <label className="manage-form-field">
          <span>New proposed budget</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={authorBudget}
            onChange={event => setAuthorBudget(event.target.value)}
            required
          />
        </label>
        <div className="manage-form-actions">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Submitting...' : 'Submit counter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CounterBudgetModal;
