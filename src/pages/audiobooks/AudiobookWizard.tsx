import { useEffect, useState } from 'react';
import { useFilePreviewUrl } from '../../hooks/useFilePreviewUrl';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Crown,
  FileText,
  Image as ImageIcon,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import WizardShell from '../../components/wizard/WizardShell';
import type { WizardStepConfig } from '../../components/wizard/WizardStepper';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchGenres } from '../../store/slices/genresSlice';
import { fetchLanguages } from '../../store/slices/languagesSlice';
import { fetchTags } from '../../store/slices/tagsSlice';
import {
  createAudiobookThunk,
  fetchAudiobooks,
  updateAudiobookThunk,
} from '../../store/slices/audiobooksSlice';
import type { AudiobookApiResponse, AudiobookWizardData } from '../../types/audiobook';
import {
  getMoods,
  getSubscriptionPlans,
  type MoodItem,
  type SubscriptionPlanItem,
} from '../../utils/audiobookApi';
import { resolveAudiobookOwner } from '../../utils/resolveAudiobookOwner';
import type { AudioBookOwnerInput } from '../../types/audiobook';
import { showApiError } from '../../utils/toast';
import {
  buildCreateAudiobookRequest,
  buildUpdateAudiobookRequest,
  createEmptyAudiobookWizardData,
  hydrateAudiobookWizardData,
  validateAudiobookForPublish,
  validateAudiobookForSchedule,
  validateAudiobookStep,
  type AudiobookWizardStep,
} from '../../utils/audiobookWizard';
import { resolveDefaultLanguageName } from '../../utils/languages';
import AudiobookLivePreview from './components/wizard/AudiobookLivePreview';
import BasicsStep from './components/wizard/steps/BasicsStep';
import ContributorsStep from './components/wizard/steps/ContributorsStep';
import ContentAssetsStep from './components/wizard/steps/ContentAssetsStep';
import ReviewPublishStep from './components/wizard/steps/ReviewPublishStep';
import SubscriptionTiersStep from './components/wizard/steps/SubscriptionTiersStep';
import '../../styles/components/wizard/WizardShell.css';
import '../../styles/pages/audiobooks/AudiobookWizard.css';

const AUDIOBOOK_STEPS: WizardStepConfig[] = [
  { label: 'Basics', description: 'Tell us the essentials', icon: FileText },
  { label: 'Contributors', description: 'Add authors & details', icon: Users },
  {
    label: 'Content & Assets',
    description: 'Upload cover image',
    icon: ImageIcon,
  },
  {
    label: 'Subscription tiers',
    description: 'Set access and pricing',
    icon: Crown,
  },
  {
    label: 'Review & Publish',
    description: 'Finalize and publish',
    icon: BookOpen,
  },
];

const DRAFT_STORAGE_KEY = 'audiobook-wizard-draft';

function AudiobookWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { role, appType } = useAppSelector(state => state.auth);
  const mode = id ? 'edit' : 'create';

  const { genres, loading: genresLoading } = useAppSelector(
    state => state.genres
  );
  const { languages, loading: languagesLoading } = useAppSelector(
    state => state.languages
  );
  const { tags, loading: tagsLoading } = useAppSelector(state => state.tags);
  const { loading, filter } = useAppSelector(state => state.audiobooks);

  const editingAudiobook = (location.state as { audiobook?: AudiobookApiResponse })
    ?.audiobook;

  const [step, setStep] = useState<AudiobookWizardStep>(1);
  const [data, setData] = useState<AudiobookWizardData>(
    createEmptyAudiobookWizardData()
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof AudiobookWizardData | 'scheduledAt', string>>
  >({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [audiobookOwner, setAudiobookOwner] = useState<AudioBookOwnerInput | null>(
    null
  );
  const [ownerError, setOwnerError] = useState('');
  const [moods, setMoods] = useState<MoodItem[]>([]);
  const [moodsLoading, setMoodsLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlanItem[]
  >([]);
  const [subscriptionPlansLoading, setSubscriptionPlansLoading] =
    useState(false);

  useEffect(() => {
    if (genres.length === 0) {
      dispatch(fetchGenres());
    }
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
    if (languages.length === 0) {
      dispatch(fetchLanguages());
    }
  }, [dispatch, genres.length, tags.length, languages.length]);

  useEffect(() => {
    if (
      mode === 'edit' &&
      editingAudiobook &&
      genres.length > 0 &&
      tags.length > 0
    ) {
      setData(
        hydrateAudiobookWizardData(
          editingAudiobook,
          genres,
          tags,
          languages
        )
      );
    }
  }, [mode, editingAudiobook, genres, tags, languages]);

  useEffect(() => {
    if (mode !== 'create' || languages.length === 0) {
      return;
    }

    const defaultLanguage = resolveDefaultLanguageName(languages);
    setData(prev => {
      const hasKnownLanguage = languages.some(
        language => language.name === prev.language
      );

      if (hasKnownLanguage) {
        return prev;
      }

      return { ...prev, language: defaultLanguage };
    });
  }, [mode, languages]);

  useEffect(() => {
    if (mode === 'edit') {
      return;
    }

    const fetchOwner = async () => {
      try {
        const owner = await resolveAudiobookOwner(role, appType);
        if (owner) {
          setAudiobookOwner(owner);
        } else {
          setOwnerError('No organization or author workspace found for your account');
        }
      } catch (error) {
        showApiError(error);
        setOwnerError('Failed to resolve audiobook owner');
      }
    };

    void fetchOwner();
  }, [mode, role, appType]);

  useEffect(() => {
    const fetchWizardCatalogData = async () => {
      setMoodsLoading(true);
      setSubscriptionPlansLoading(true);

      try {
        const [moodsResult, plansResult] = await Promise.allSettled([
          getMoods(),
          getSubscriptionPlans(),
        ]);

        if (moodsResult.status === 'fulfilled') {
          setMoods(moodsResult.value);
        } else {
          showApiError(moodsResult.reason);
        }

        if (plansResult.status === 'fulfilled') {
          setSubscriptionPlans(plansResult.value);
        } else {
          showApiError(plansResult.reason);
        }
      } catch (error) {
        showApiError(error);
      } finally {
        setMoodsLoading(false);
        setSubscriptionPlansLoading(false);
      }
    };

    void fetchWizardCatalogData();
  }, []);

  const coverPreviewUrl = useFilePreviewUrl(
    data.coverImage,
    data.existingCoverUrl
  );

  const updateData = (updates: Partial<AudiobookWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setDraftSaved(false);
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors = validateAudiobookStep(step, data, mode);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setStep(prev => Math.min(5, prev + 1) as AudiobookWizardStep);
  };

  const handleBack = () => {
    setErrors({});
    setStep(prev => Math.max(1, prev - 1) as AudiobookWizardStep);
  };

  const handleSaveDraft = () => {
    const { coverImage: _cover, ...draft } = data;
    void _cover;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftSaved(true);
    toast.success('Draft saved');
  };

  const submitAudiobook = async (scheduled: boolean) => {
    const submissionData = {
      ...data,
      scheduledAt: scheduled ? data.scheduledAt : undefined,
    };
    const validationErrors = scheduled
      ? validateAudiobookForSchedule(submissionData)
      : validateAudiobookForPublish(submissionData, mode);

    if (
      Object.keys(validationErrors).length > 0 ||
      (mode === 'create' && !audiobookOwner)
    ) {
      setErrors(validationErrors);
      if (!audiobookOwner && mode === 'create') {
        setOwnerError('Audiobook owner is required');
      }
      return;
    }

    try {
      if (mode === 'edit' && id) {
        await dispatch(
          updateAudiobookThunk(buildUpdateAudiobookRequest(id, submissionData))
        ).unwrap();
      } else {
        await dispatch(
          createAudiobookThunk(
            buildCreateAudiobookRequest(
              submissionData,
              audiobookOwner ?? undefined
            )
          )
        ).unwrap();
      }
      await dispatch(fetchAudiobooks({ page: 1, filter }));
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      navigate('/library');
    } catch (error) {
      showApiError(error);
    }
  };

  const title =
    mode === 'edit' ? 'Edit Audiobook' : 'Create New Audiobook';
  const subtitle =
    mode === 'edit'
      ? 'Update your audiobook details across guided steps.'
      : "Let's set up your audiobook in a few guided steps.";

  return (
    <WizardShell
      className="audiobook-wizard"
      title={title}
      subtitle={subtitle}
      mode={mode}
      currentStep={step}
      totalSteps={5}
      steps={AUDIOBOOK_STEPS}
      draftSaved={draftSaved}
      isLoading={loading}
      preview={
        <AudiobookLivePreview
          data={data}
          coverPreviewUrl={coverPreviewUrl}
          genres={genres}
          tags={tags}
          moods={moods}
          subscriptionPlans={subscriptionPlans}
        />
      }
      onCancel={() => navigate('/library')}
      onSaveDraft={mode === 'create' ? handleSaveDraft : undefined}
      onBack={step > 1 ? handleBack : undefined}
      onContinue={step < 5 ? handleContinue : undefined}
      onPublish={step === 5 ? () => void submitAudiobook(false) : undefined}
      onSchedule={step === 5 ? () => void submitAudiobook(true) : undefined}
      scheduledAt={data.scheduledAt}
      scheduleError={errors.scheduledAt}
      onScheduledAtChange={scheduledAt => {
        updateData({ scheduledAt });
        setErrors(prev => ({ ...prev, scheduledAt: undefined }));
      }}
      showBack={step > 1}
      showContinue={step < 5}
      showPublishActions={step === 5}
    >
      {ownerError && step === 1 && mode === 'create' && (
        <p className="wizard-field-error">{ownerError}</p>
      )}

      {step === 1 && (
        <BasicsStep
          data={data}
          errors={errors}
          genres={genres}
          tags={tags}
          moods={moods}
          languages={languages}
          genresLoading={genresLoading}
          tagsLoading={tagsLoading}
          moodsLoading={moodsLoading}
          languagesLoading={languagesLoading}
          isLoading={loading}
          onChange={updateData}
        />
      )}
      {step === 2 && (
        <ContributorsStep
          data={data}
          errors={errors}
          isLoading={loading}
          onChange={updateData}
        />
      )}
      {step === 3 && (
        <ContentAssetsStep
          data={data}
          errors={errors}
          mode={mode}
          isLoading={loading}
          onChange={updateData}
        />
      )}
      {step === 4 && (
        <SubscriptionTiersStep
          data={data}
          errors={errors}
          subscriptionPlans={subscriptionPlans}
          subscriptionPlansLoading={subscriptionPlansLoading}
          isLoading={loading}
          onChange={updateData}
        />
      )}
      {step === 5 && (
        <ReviewPublishStep
          data={data}
          genres={genres}
          tags={tags}
          moods={moods}
          onNavigateToStep={targetStep => {
            setErrors({});
            setStep(targetStep);
          }}
        />
      )}
    </WizardShell>
  );
}

export default AudiobookWizard;
