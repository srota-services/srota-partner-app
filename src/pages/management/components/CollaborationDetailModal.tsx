import React from 'react';
import Modal from '../../../components/common/Modal';
import type {
  AuthorCollaboration,
  OrgCollaboration,
} from '../../../types/authorCollaboration';
import {
  formatBudget,
  formatCollaborationStatus,
  getCollaborationAuthorName,
} from '../../../utils/collaborationDisplay';

interface CollaborationDetailModalProps {
  isOpen: boolean;
  collaboration: AuthorCollaboration | OrgCollaboration | null;
  onClose: () => void;
}

function isOrgCollaboration(
  collaboration: AuthorCollaboration | OrgCollaboration
): collaboration is OrgCollaboration {
  return 'author' in collaboration;
}

const CollaborationDetailModal: React.FC<CollaborationDetailModalProps> = ({
  isOpen,
  collaboration,
  onClose,
}) => {
  if (!collaboration) {
    return null;
  }

  const partnerLabel = isOrgCollaboration(collaboration)
    ? getCollaborationAuthorName(collaboration.author)
    : collaboration.organization.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collaboration details" size="large">
      <div className="collaboration-detail">
        <p>
          <strong>Partner:</strong> {partnerLabel}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          {formatCollaborationStatus(collaboration.status)}
        </p>
        <p>
          <strong>Turn:</strong> {collaboration.turn}
        </p>
        <p>
          <strong>Author budget:</strong>{' '}
          {formatBudget(collaboration.authorBudget, collaboration.currency)}
        </p>
        {collaboration.organizationAsk != null && (
          <p>
            <strong>Organization ask:</strong>{' '}
            {formatBudget(collaboration.organizationAsk, collaboration.currency)}
          </p>
        )}
        {collaboration.acceptedBudget != null && (
          <p>
            <strong>Accepted budget:</strong>{' '}
            {formatBudget(collaboration.acceptedBudget, collaboration.currency)}
          </p>
        )}
        {collaboration.description && (
          <p>
            <strong>Description:</strong> {collaboration.description}
          </p>
        )}

        {collaboration.attachments.length > 0 && (
          <div>
            <strong>Attachments</strong>
            <ul>
              {collaboration.attachments.map(attachment => (
                <li key={attachment.id}>{attachment.originalName}</li>
              ))}
            </ul>
          </div>
        )}

        {collaboration.rounds.length > 0 && (
          <div>
            <strong>Negotiation rounds</strong>
            <ul>
              {collaboration.rounds.map(round => (
                <li key={round.id}>
                  {round.actor}:{' '}
                  {round.authorBudget != null
                    ? formatBudget(round.authorBudget, collaboration.currency)
                    : round.organizationAsk != null
                      ? formatBudget(
                          round.organizationAsk,
                          collaboration.currency
                        )
                      : '—'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CollaborationDetailModal;
