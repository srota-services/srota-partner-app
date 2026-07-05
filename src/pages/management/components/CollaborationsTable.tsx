import React from 'react';
import type {
  AuthorCollaboration,
  OrgCollaboration,
} from '../../../types/authorCollaboration';
import {
  formatBudget,
  formatCollaborationStatus,
  getCollaborationAuthorName,
} from '../../../utils/collaborationDisplay';
import Button from '../../../components/common/Button';
import '../../../styles/pages/management/components/AuthorsTable.css';

interface CollaborationsTableProps {
  collaborations: Array<AuthorCollaboration | OrgCollaboration>;
  actionLoadingId: string | null;
  isOrgView: boolean;
  onView: (collaboration: AuthorCollaboration | OrgCollaboration) => void;
  onAccept?: (collaborationId: string) => void;
  onReject?: (collaborationId: string) => void;
  onNegotiate?: (collaboration: OrgCollaboration) => void;
  onCounter?: (collaboration: AuthorCollaboration) => void;
  onAbort?: (collaborationId: string) => void;
}

function getPartnerName(
  collaboration: AuthorCollaboration | OrgCollaboration,
  isOrgView: boolean
): string {
  if (isOrgView && 'author' in collaboration) {
    return getCollaborationAuthorName(collaboration.author);
  }
  if ('organization' in collaboration) {
    return collaboration.organization.name;
  }
  return 'Unknown';
}

const CollaborationsTable: React.FC<CollaborationsTableProps> = ({
  collaborations,
  actionLoadingId,
  isOrgView,
  onView,
  onAccept,
  onReject,
  onNegotiate,
  onCounter,
  onAbort,
}) => {
  return (
    <div className="authors-table-wrapper">
      <table className="authors-table">
        <thead>
          <tr>
            <th>{isOrgView ? 'Author' : 'Organization'}</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Turn</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collaborations.map(collaboration => {
            const isLoading = actionLoadingId === collaboration.id;
            const canOrgAct =
              isOrgView &&
              (collaboration.status === 'PENDING_ORG_REVIEW' ||
                collaboration.status === 'NEGOTIATION');
            const canAuthorCounter =
              !isOrgView &&
              collaboration.status === 'NEGOTIATION' &&
              collaboration.turn === 'AUTHOR';
            const canAuthorAbort =
              !isOrgView &&
              (collaboration.status === 'PENDING_ORG_REVIEW' ||
                collaboration.status === 'NEGOTIATION');

            return (
              <tr key={collaboration.id}>
                <td>{getPartnerName(collaboration, isOrgView)}</td>
                <td>{formatCollaborationStatus(collaboration.status)}</td>
                <td>
                  {formatBudget(
                    collaboration.authorBudget,
                    collaboration.currency
                  )}
                </td>
                <td>{collaboration.turn}</td>
                <td className="authors-table-actions">
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={() => onView(collaboration)}
                  >
                    View
                  </Button>
                  {canOrgAct && onAccept && (
                    <Button
                      type="button"
                      variant="primary"
                      size="small"
                      disabled={isLoading}
                      onClick={() => onAccept(collaboration.id)}
                    >
                      Accept
                    </Button>
                  )}
                  {canOrgAct && onReject && (
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      disabled={isLoading}
                      onClick={() => onReject(collaboration.id)}
                    >
                      Reject
                    </Button>
                  )}
                  {canOrgAct && onNegotiate && 'author' in collaboration && (
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      disabled={isLoading}
                      onClick={() => onNegotiate(collaboration)}
                    >
                      Negotiate
                    </Button>
                  )}
                  {canAuthorCounter && onCounter && 'organization' in collaboration && (
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      disabled={isLoading}
                      onClick={() => onCounter(collaboration)}
                    >
                      Counter
                    </Button>
                  )}
                  {canAuthorAbort && onAbort && (
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      disabled={isLoading}
                      onClick={() => onAbort(collaboration.id)}
                    >
                      Abort
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CollaborationsTable;
