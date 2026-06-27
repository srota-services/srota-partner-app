import { useEffect, useState } from 'react';
import { useFilePreviewUrl } from '../../hooks/useFilePreviewUrl';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Headphones,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import WizardShell from '../../components/wizard/WizardShell';
import type { WizardStepConfig } from '../../components/wizard/WizardStepper';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  createChapterThunk,
  fetchChapters,
  updateChapterThunk,
} from '../../store/slices/chaptersSlice';
import type { ChapterApiResponse, ChapterWizardData } from '../../types/audiobook';
import {
  getSubscriptionPlans,
  type SubscriptionPlanItem,
} from '../../utils/audiobookApi';
import { showApiError } from '../../utils/toast';
import {
  buildCreateChapterRequest,
  buildUpdateChapterRequest,
  createEmptyChapterWizardData,
  hydrateChapterWizardData,
  loadAudioMetadata,
  validateChapterForPublish,
  validateChapterForSchedule,
  validateChapterStep,
  type ChapterWizardStep,
} from '../../utils/chapterWizard';
import ChapterLivePreview from './components/wizard/ChapterLivePreview';
import ChapterBasicsStep from './components/wizard/steps/ChapterBasicsStep';
import ChapterAudioStep from './components/wizard/steps/ChapterAudioStep';
import ChapterContentAssetsStep from './components/wizard/steps/ChapterContentAssetsStep';
import ChapterReviewPublishStep from './components/wizard/steps/ChapterReviewPublishStep';
import '../../styles/components/wizard/WizardShell.css';

const CHAPTER_STEPS: WizardStepConfig[] = [
  { label: 'Basics', description: 'Chapter details', icon: FileText },
  { label: 'Audio', description: 'Upload audio file', icon: Headphones },
  {
    label: 'Content & Assets',
    description: 'Upload cover image',
    icon: ImageIcon,
  },
  {
    label: 'Review & Publish',
    description: 'Finalize and publish',
    icon: BookOpen,
  },
];

const DRAFT_STORAGE_PREFIX = 'chapter-wizard-draft-';

function ChapterWizard() {
  const { id: audiobookId, chapterId } = useParams<{
    id: string;
    chapterId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const mode = chapterId ? 'edit' : 'create';

  const { chapters, loading, currentPage } = useAppSelector(
    state => state.chapters
  );

  const editingChapter = (location.state as { chapter?: ChapterApiResponse })
    ?.chapter;

  const sortedChapters = [...chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );
  const lastChapter = sortedChapters.at(-1);
  const nextChapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

  const [step, setStep] = useState<ChapterWizardStep>(1);
  const [data, setData] = useState<ChapterWizardData>(
    createEmptyChapterWizardData(nextChapterNumber)
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ChapterWizardData | 'scheduledAt', string>>
  >({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlanItem[]
  >([]);
  const [subscriptionPlansLoading, setSubscriptionPlansLoading] =
    useState(false);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      setSubscriptionPlansLoading(true);

      try {
        const plans = await getSubscriptionPlans();
        setSubscriptionPlans(plans);
      } catch (error) {
        showApiError(error);
      } finally {
        setSubscriptionPlansLoading(false);
      }
    };

    void fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    if (mode === 'create') {
      setData(createEmptyChapterWizardData(nextChapterNumber));
    }
  }, [mode, nextChapterNumber]);

  useEffect(() => {
    if (mode === 'edit' && editingChapter) {
      setData(hydrateChapterWizardData(editingChapter));
    }
  }, [mode, editingChapter]);

  const coverPreviewUrl = useFilePreviewUrl(
    data.coverImage,
    data.existingCoverUrl
  );

  const updateData = (updates: Partial<ChapterWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setDraftSaved(false);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      updateData({
        file: null,
        duration: undefined,
        startPosition: undefined,
        endPosition: undefined,
      });
      return;
    }

    setIsLoadingMetadata(true);
    try {
      const metadata = await loadAudioMetadata(file);
      updateData({
        file,
        duration: metadata.duration,
        startPosition: metadata.startPosition,
        endPosition: metadata.endPosition,
      });
    } catch (error) {
      showApiError(error);
      updateData({ file: null });
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors = validateChapterStep(step, data, mode);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setStep(prev => Math.min(4, prev + 1) as ChapterWizardStep);
  };

  const handleBack = () => {
    setErrors({});
    setStep(prev => Math.max(1, prev - 1) as ChapterWizardStep);
  };

  const handleSaveDraft = () => {
    if (!audiobookId) {
      return;
    }
    const { file: _file, coverImage: _cover, ...draft } = data;
    void _file;
    void _cover;
    localStorage.setItem(
      `${DRAFT_STORAGE_PREFIX}${audiobookId}`,
      JSON.stringify(draft)
    );
    setDraftSaved(true);
    toast.success('Draft saved');
  };

  const submitChapter = async (scheduled: boolean) => {
    if (!audiobookId) {
      return;
    }

    const submissionData = {
      ...data,
      scheduledAt: scheduled ? data.scheduledAt : undefined,
    };
    const validationErrors = scheduled
      ? validateChapterForSchedule(submissionData, mode)
      : validateChapterForPublish(submissionData, mode);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const hadNewAudio = Boolean(submissionData.file);
      if (mode === 'edit' && chapterId) {
        await dispatch(
          updateChapterThunk(buildUpdateChapterRequest(chapterId, submissionData))
        ).unwrap();
        if (hadNewAudio) {
          toast.success('Audio updated. Stream variants are re-processing…');
        }
      } else {
        await dispatch(
          createChapterThunk(
            buildCreateChapterRequest(audiobookId, submissionData)
          )
        ).unwrap();
        if (hadNewAudio) {
          toast.success('Chapter published. Stream variants are processing…');
        }
      }

      await dispatch(
        fetchChapters({ audiobookId, page: currentPage })
      );
      localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${audiobookId}`);
      navigate(`/audiobooks/${audiobookId}/chapters`);
    } catch (error) {
      showApiError(error);
    }
  };

  const title = mode === 'edit' ? 'Edit Chapter' : 'Create New Chapter';
  const subtitle =
    mode === 'edit'
      ? 'Update your chapter details across guided steps.'
      : "Let's set up your chapter in a few guided steps.";

  return (
    <WizardShell
      title={title}
      subtitle={subtitle}
      mode={mode}
      currentStep={step}
      totalSteps={4}
      steps={CHAPTER_STEPS}
      draftSaved={draftSaved}
      isLoading={loading || isLoadingMetadata}
      preview={
        <ChapterLivePreview
          data={data}
          coverPreviewUrl={coverPreviewUrl}
          subscriptionPlans={subscriptionPlans}
        />
      }
      onCancel={() =>
        audiobookId
          ? navigate(`/audiobooks/${audiobookId}/chapters`)
          : navigate('/audiobooks')
      }
      onSaveDraft={mode === 'create' ? handleSaveDraft : undefined}
      onBack={step > 1 ? handleBack : undefined}
      onContinue={step < 4 ? handleContinue : undefined}
      onPublish={step === 4 ? () => void submitChapter(false) : undefined}
      onSchedule={step === 4 ? () => void submitChapter(true) : undefined}
      scheduledAt={data.scheduledAt}
      scheduleError={errors.scheduledAt}
      onScheduledAtChange={scheduledAt => {
        updateData({ scheduledAt });
        setErrors(prev => ({ ...prev, scheduledAt: undefined }));
      }}
      showBack={step > 1}
      showContinue={step < 4}
      showPublishActions={step === 4}
    >
      {step === 1 && (
        <ChapterBasicsStep
          data={data}
          errors={errors}
          subscriptionPlans={subscriptionPlans}
          subscriptionPlansLoading={subscriptionPlansLoading}
          isLoading={loading}
          onChange={updateData}
        />
      )}
      {step === 2 && (
        <ChapterAudioStep
          data={data}
          errors={errors}
          mode={mode}
          isLoading={loading}
          isLoadingMetadata={isLoadingMetadata}
          onFileChange={handleFileChange}
          onChange={updateData}
        />
      )}
      {step === 3 && (
        <ChapterContentAssetsStep
          data={data}
          errors={errors}
          isLoading={loading}
          onChange={updateData}
        />
      )}
      {step === 4 && (
        <ChapterReviewPublishStep
          data={data}
          onNavigateToStep={targetStep => {
            setErrors({});
            setStep(targetStep);
          }}
        />
      )}
    </WizardShell>
  );
}

export default ChapterWizard;
