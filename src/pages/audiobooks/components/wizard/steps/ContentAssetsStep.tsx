import ImageUploadZone from '../../../../../components/common/ImageUploadZone';
import type { AudiobookWizardData } from '../../../../../types/audiobook';

interface ContentAssetsStepProps {
  data: AudiobookWizardData;
  errors: Partial<Record<keyof AudiobookWizardData, string>>;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  onChange: (updates: Partial<AudiobookWizardData>) => void;
}

function ContentAssetsStep({
  data,
  errors,
  mode,
  isLoading = false,
  onChange,
}: ContentAssetsStepProps) {
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
          recommendedSizeHint="700 × 1000"
          ariaLabel="Upload cover image"
        />
        {errors.coverImage && (
          <span className="wizard-field-error">{errors.coverImage}</span>
        )}
      </div>
    </div>
  );
}

export default ContentAssetsStep;
