import ImageUploadZone from '../../../../../components/common/ImageUploadZone';
import type { ChapterWizardData } from '../../../../../types/audiobook';

interface ChapterContentAssetsStepProps {
  data: ChapterWizardData;
  errors: Partial<Record<keyof ChapterWizardData, string>>;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  onChange: (updates: Partial<ChapterWizardData>) => void;
}

function ChapterContentAssetsStep({
  data,
  errors,
  mode,
  isLoading = false,
  onChange,
}: ChapterContentAssetsStepProps) {
  const hasExistingCover = Boolean(data.existingCoverUrl);

  return (
    <div className="wizard-step-form">
      <div className="wizard-field-group">
        <label>
          Cover Image{' '}
          {mode === 'create' ? (
            <span className="wizard-required">*</span>
          ) : (
            <span className="optional-text">
              (optional - leave empty to keep current cover)
            </span>
          )}
        </label>
        {mode === 'edit' && hasExistingCover && !data.coverImage && (
          <p className="narrators-hint">
            Current cover image is shown in the live preview panel.
          </p>
        )}
        {!hasExistingCover && !data.coverImage && (
          <p className="narrators-hint">
            Uploaded cover images appear in the live preview panel.
          </p>
        )}
        <ImageUploadZone
          value={data.coverImage}
          onChange={coverImage => onChange({ coverImage })}
          showPreview={false}
          disabled={isLoading}
          recommendedSizeHint="960 × 960"
        />
        {errors.coverImage && (
          <span className="wizard-field-error">{errors.coverImage}</span>
        )}
      </div>
    </div>
  );
}

export default ChapterContentAssetsStep;
