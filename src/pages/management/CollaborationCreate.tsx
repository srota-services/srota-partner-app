import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlignLeft,
  Building2,
  HandCoins,
  Paperclip,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import DocumentUploadZone from '../../components/common/DocumentUploadZone';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WizardFieldLabel from '../../components/wizard/WizardFieldLabel';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createCollaboration } from '../../store/slices/collaborationsSlice';
import { COLLABORATION_CURRENCY } from '../../types/authorCollaboration';
import {
  getAllOrganizations,
  type CatalogOrganizationItem,
} from '../../utils/audiobookApi';
import { showApiError, showSuccess } from '../../utils/toast';
import { COLLABORATION_DESCRIPTION_PLACEHOLDER } from '../../utils/collaborationRequestPreview';
import CollaborationRequestPreview from './components/CollaborationRequestPreview';
import '../../styles/components/wizard/WizardShell.css';
import '../../styles/pages/management/CollaborationCreate.css';

function CollaborationCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const saving = useAppSelector(state => state.collaborations.saving);
  const userName = useAppSelector(state => state.auth.user?.name ?? '');

  const prefilledOrganizationId = searchParams.get('organizationId') ?? '';
  const prefilledOrganizationName = searchParams.get('organizationName') ?? '';

  const [organizations, setOrganizations] = useState<CatalogOrganizationItem[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [organizationId, setOrganizationId] = useState(prefilledOrganizationId);
  const [description, setDescription] = useState('');
  const [authorBudget, setAuthorBudget] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    organizationId?: string;
    authorBudget?: string;
  }>({});

  const isOrganizationLocked = Boolean(prefilledOrganizationId);

  useEffect(() => {
    let cancelled = false;
    setLoadingOrgs(true);

    getAllOrganizations(1, 100)
      .then(response => {
        if (!cancelled) {
          setOrganizations(response.organizations);
        }
      })
      .catch(error => {
        if (!cancelled) {
          showApiError(error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingOrgs(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const organizationOptions = useMemo(
    () =>
      organizations.map(org => ({
        value: org.id,
        label: org.name,
      })),
    [organizations]
  );

  const selectedOrganizationName = useMemo(() => {
    if (prefilledOrganizationName.trim()) {
      return prefilledOrganizationName.trim();
    }

    if (!organizationId.trim()) {
      return '';
    }

    return (
      organizations.find(org => org.id === organizationId)?.name ??
      organizationId
    );
  }, [organizationId, organizations, prefilledOrganizationName]);

  const handleCancel = () => {
    if (prefilledOrganizationId) {
      navigate('/discovery');
      return;
    }
    navigate('/management?tab=collaborations');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    const selectedOrganizationId = organizationId.trim();
    const budget = Number(authorBudget);

    if (!selectedOrganizationId) {
      nextErrors.organizationId = 'Select an organization';
    }
    if (Number.isNaN(budget) || budget <= 0) {
      nextErrors.authorBudget = 'Enter a valid budget amount';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await dispatch(
        createCollaboration({
          organizationId: selectedOrganizationId,
          description: description.trim() || undefined,
          authorBudget: budget,
          currency: COLLABORATION_CURRENCY,
          attachments: attachment ? [attachment] : undefined,
        })
      ).unwrap();

      showSuccess('Collaboration request submitted');
      navigate('/management?tab=collaborations');
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="wizard-page collaboration-create-page">
      <div className="collaboration-create-header">
        <div>
          <h1 className="wizard-title">New Collaboration</h1>
          <p className="wizard-subtitle">
            Submit a collaboration request with your proposed budget and optional
            supporting document.
          </p>
        </div>
      </div>

      <div className="collaboration-create-layout">
        <form className="collaboration-create-form" onSubmit={handleSubmit}>
          <div className="wizard-step-form collaboration-create-form-body">
            <div className="collaboration-create-fields-row">
              <div className="wizard-field-group">
                <WizardFieldLabel htmlFor="collaboration-organization" icon={Building2} required>
                  Organization
                </WizardFieldLabel>
                {isOrganizationLocked ? (
                  <p className="collaboration-locked-organization">
                    {prefilledOrganizationName || prefilledOrganizationId}
                  </p>
                ) : loadingOrgs ? (
                  <div className="loading-container">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Select
                    id="collaboration-organization"
                    value={organizationId}
                    onChange={event => {
                      setOrganizationId(event.target.value);
                      setErrors(prev => ({ ...prev, organizationId: undefined }));
                    }}
                    options={organizationOptions}
                    placeholder="Select an organization"
                    loading={loadingOrgs}
                    disabled={saving}
                    aria-invalid={Boolean(errors.organizationId)}
                  />
                )}
                {errors.organizationId && (
                  <span className="wizard-field-error">{errors.organizationId}</span>
                )}
              </div>

              <div className="wizard-field-group">
                <WizardFieldLabel htmlFor="collaboration-budget" icon={HandCoins} required>
                  Proposed budget
                </WizardFieldLabel>
                <div className="wizard-input-with-icon collaboration-budget-input">
                  <span className="wizard-input-icon collaboration-budget-currency" aria-hidden="true">
                    ₹
                  </span>
                  <input
                    id="collaboration-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={authorBudget}
                    onChange={event => {
                      setAuthorBudget(event.target.value);
                      setErrors(prev => ({ ...prev, authorBudget: undefined }));
                    }}
                    placeholder="0.00"
                    disabled={saving}
                    aria-invalid={Boolean(errors.authorBudget)}
                  />
                </div>
                {errors.authorBudget && (
                  <span className="wizard-field-error">{errors.authorBudget}</span>
                )}
              </div>
            </div>

            <div className="wizard-field-group">
              <WizardFieldLabel htmlFor="collaboration-description" icon={AlignLeft}>
                Description
              </WizardFieldLabel>
              <textarea
                id="collaboration-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder={COLLABORATION_DESCRIPTION_PLACEHOLDER}
                rows={5}
                disabled={saving}
              />
            </div>

            <div className="wizard-field-group">
              <WizardFieldLabel icon={Paperclip}>Attachment</WizardFieldLabel>
              <DocumentUploadZone
                value={attachment}
                onChange={setAttachment}
                disabled={saving}
                ariaLabel="Upload attachment"
              />
            </div>
          </div>

          <div className="collaboration-create-footer">
            <Button
              type="button"
              variant="outline"
              size="small"
              className="wizard-btn-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Submit request
            </Button>
          </div>
        </form>

        <aside className="collaboration-create-preview-column">
          <CollaborationRequestPreview
            organizationName={selectedOrganizationName}
            description={description}
            authorBudget={authorBudget}
            hasAttachment={Boolean(attachment)}
            userName={userName}
          />
        </aside>
      </div>
    </div>
  );
}

export default CollaborationCreate;
