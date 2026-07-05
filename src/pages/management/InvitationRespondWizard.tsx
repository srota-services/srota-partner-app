import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Mail, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WizardStepIndicator from '../../components/wizard/WizardStepIndicator';
import WizardStepper from '../../components/wizard/WizardStepper';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useDiscoverableCatalogIds } from '../../hooks/useDiscoverableCatalogIds';
import {
  confirmContactThunk,
  decideJoinThunk,
  fetchMyInvitations,
  revealContactThunk,
} from '../../store/slices/authorInboxSlice';
import { getOrganizationDisplayName } from '../../utils/authorInvitationDisplay';
import { isDiscoverableOrg } from '../../utils/discoverableCatalogFilter';
import {
  getInvitationWizardStep,
  getPendingAuthorInvitations,
  isPendingAuthorAction,
} from '../../utils/authorInvitationPending';
import { showApiError, showSuccess } from '../../utils/toast';
import { store } from '../../store/store';
import InvitationContactConsentStep from './components/invitation-wizard/InvitationContactConsentStep';
import InvitationOrgContactStep from './components/invitation-wizard/InvitationOrgContactStep';
import InvitationJoinDecisionStep from './components/invitation-wizard/InvitationJoinDecisionStep';
import '../../styles/components/wizard/WizardShell.css';
import '../../styles/pages/management/InvitationRespondWizard.css';

const WIZARD_STEPS = [
  { label: 'Share contact', icon: Mail },
  { label: 'Org contact', icon: Building2 },
  { label: 'Join decision', icon: UserCheck },
];

function InvitationRespondWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { invitations, loading, actionLoadingId } = useAppSelector(
    state => state.authorInbox
  );
  const { orgIds, loading: catalogLoading } = useDiscoverableCatalogIds();

  useEffect(() => {
    dispatch(fetchMyInvitations()).catch(showApiError);
  }, [dispatch]);

  const requestedInvitationId = searchParams.get('invitationId');

  const discoverableInvitations = useMemo(
    () =>
      invitations.filter(invitation =>
        isDiscoverableOrg(invitation.organization.id, orgIds)
      ),
    [invitations, orgIds]
  );

  const activeInvitation = useMemo(() => {
    if (discoverableInvitations.length === 0) {
      return null;
    }

    if (requestedInvitationId) {
      const match = discoverableInvitations.find(
        invitation => invitation.id === requestedInvitationId
      );
      if (match) {
        return match;
      }
    }

    const pending = getPendingAuthorInvitations(discoverableInvitations);
    return pending[0] ?? null;
  }, [discoverableInvitations, requestedInvitationId]);

  const currentStep = activeInvitation
    ? getInvitationWizardStep(activeInvitation.status)
    : null;

  const isLoading = activeInvitation
    ? actionLoadingId === activeInvitation.id
    : false;

  const handleCancel = () => {
    navigate('/management?tab=invitations');
  };

  const handleAfterAction = () => {
    const latestInvitations = store.getState().authorInbox.invitations;
    const pending = getPendingAuthorInvitations(latestInvitations);
    const nextPending = pending.find(
      invitation => invitation.id !== activeInvitation?.id
    );

    if (nextPending) {
      navigate(
        `/management/invitations/respond?invitationId=${nextPending.id}`,
        { replace: true }
      );
      return;
    }

    navigate('/management?tab=invitations');
  };

  const handleReveal = async (reveal: boolean) => {
    if (!activeInvitation) {
      return;
    }

    try {
      const result = await dispatch(
        revealContactThunk({ invitationId: activeInvitation.id, reveal })
      ).unwrap();
      showSuccess(result.message);

      if (!isPendingAuthorAction(result.invitation.status)) {
        handleAfterAction();
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const handleConfirmContact = async (contacted: boolean) => {
    if (!activeInvitation) {
      return;
    }

    try {
      const result = await dispatch(
        confirmContactThunk({
          invitationId: activeInvitation.id,
          contacted,
        })
      ).unwrap();
      showSuccess(result.message);

      if (contacted && !isPendingAuthorAction(result.invitation.status)) {
        handleAfterAction();
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const handleJoin = async (accept: boolean) => {
    if (!activeInvitation) {
      return;
    }

    try {
      const result = await dispatch(
        decideJoinThunk({ invitationId: activeInvitation.id, accept })
      ).unwrap();
      showSuccess(result.message);
      handleAfterAction();
    } catch (error) {
      showApiError(error);
    }
  };

  if (loading || catalogLoading) {
    return (
      <div className="loading-container invitation-respond-wizard-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!activeInvitation || currentStep === null) {
    return (
      <div className="wizard-page invitation-respond-wizard">
        <div className="invitation-respond-wizard-header">
          <h1 className="wizard-title">Respond to invitation</h1>
          <p className="wizard-subtitle">
            {activeInvitation &&
            (activeInvitation.status === 'ACCEPTED' ||
              activeInvitation.status === 'DECLINED')
              ? 'This invitation has already been completed.'
              : 'No pending invitations require your response.'}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Back to Invitations
        </Button>
      </div>
    );
  }

  const orgName = getOrganizationDisplayName(activeInvitation.organization);

  return (
    <div className="wizard-page invitation-respond-wizard">
      <div className="invitation-respond-wizard-header">
        <div className="invitation-respond-wizard-title-row">
          <div>
            <h1 className="wizard-title">Respond to invitation</h1>
            <p className="wizard-subtitle">
              Complete the steps to respond to your invitation from {orgName}.
            </p>
          </div>
          <WizardStepIndicator currentStep={currentStep} totalSteps={3} />
        </div>
      </div>

      <div className="invitation-respond-wizard-body marketing-card">
        <WizardStepper steps={WIZARD_STEPS} currentStep={currentStep} />

        <div className="invitation-respond-wizard-step-content">
          {currentStep === 1 && (
            <InvitationContactConsentStep
              invitation={activeInvitation}
              isLoading={isLoading}
              onReveal={handleReveal}
              layout="wizard"
            />
          )}
          {currentStep === 2 && (
            <InvitationOrgContactStep
              invitation={activeInvitation}
              isLoading={isLoading}
              onConfirmContact={handleConfirmContact}
              layout="wizard"
            />
          )}
          {currentStep === 3 && (
            <InvitationJoinDecisionStep
              invitation={activeInvitation}
              onJoin={handleJoin}
              isLoading={isLoading}
              layout="wizard"
            />
          )}
        </div>

        <div className="invitation-respond-wizard-footer">
          <Button
            type="button"
            variant="outline"
            size="small"
            className="wizard-btn-cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Back to Invitations
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InvitationRespondWizard;
