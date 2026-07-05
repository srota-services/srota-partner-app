import { Eye } from 'lucide-react';
import {
  COLLABORATION_DESCRIPTION_PLACEHOLDER,
  formatCollaborationRequestBudget,
  type CollaborationRequestPreviewInput,
} from '../../../utils/collaborationRequestPreview';

interface CollaborationRequestPreviewProps extends CollaborationRequestPreviewInput {}

function CollaborationRequestPreview({
  organizationName,
  description,
  authorBudget,
  hasAttachment,
  userName,
}: CollaborationRequestPreviewProps) {
  const budget = formatCollaborationRequestBudget(authorBudget);
  const trimmedDescription = description.trim();
  const displayOrganizationName = organizationName.trim() || 'Organization name';
  const displayUserName = userName.trim() || 'Your name';

  return (
    <div className="wizard-preview-card collaboration-request-preview">
      <div className="wizard-preview-header">
        <span className="wizard-field-label-icon-wrap" aria-hidden="true">
          <Eye size={14} className="wizard-field-label-icon" />
        </span>
        <div>
          <h3 className="wizard-preview-title">Request Preview</h3>
          <p className="wizard-preview-subtitle">
            How your request will read to the organization
          </p>
        </div>
      </div>

      <div
        className="collaboration-request-preview-message"
        aria-live="polite"
        aria-atomic="true"
      >
        <p>
          Hi{' '}
          <span
            className={
              organizationName.trim()
                ? undefined
                : 'collaboration-request-preview-placeholder'
            }
          >
            {displayOrganizationName}
          </span>
          ,
        </p>

        {trimmedDescription ? (
          <p className="collaboration-request-preview-description">
            {trimmedDescription}
          </p>
        ) : (
          <p className="collaboration-request-preview-description collaboration-request-preview-placeholder">
            {COLLABORATION_DESCRIPTION_PLACEHOLDER}
          </p>
        )}

        <p>
          My proposed budget is{' '}
          <span
            className={
              budget ? undefined : 'collaboration-request-preview-placeholder'
            }
          >
            {budget ?? 'your proposed budget'}
          </span>
        </p>

        {hasAttachment ? (
          <p>Please find attached my short script.</p>
        ) : null}

        <p className="collaboration-request-preview-signoff">
          Thanks &amp; Regards,
          <br />
          <span
            className={
              userName.trim()
                ? undefined
                : 'collaboration-request-preview-placeholder'
            }
          >
            {displayUserName}
          </span>
        </p>
      </div>
    </div>
  );
}

export default CollaborationRequestPreview;
