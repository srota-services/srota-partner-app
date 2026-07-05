import { formatDurationDetailed, getFileNameFromUrl } from '../../../../../utils/formatting';
import AudioUploadZone from '../../../../../components/common/AudioUploadZone';
import type { ChapterWizardData } from '../../../../../types/audiobook';

interface ChapterAudioStepProps {
  data: ChapterWizardData;
  errors: Partial<Record<keyof ChapterWizardData, string>>;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  isLoadingMetadata?: boolean;
  onFileChange: (file: File | null) => void;
  onChange: (updates: Partial<ChapterWizardData>) => void;
}

function ChapterAudioStep({
  data,
  errors,
  mode,
  isLoading = false,
  isLoadingMetadata = false,
  onFileChange,
  onChange,
}: ChapterAudioStepProps) {
  const existingAudioLabel =
    mode === 'edit' && data.existingAudioUrl && !data.file
      ? getFileNameFromUrl(data.existingAudioUrl)
      : null;
  const showAudioMetadata = data.duration !== undefined;

  return (
    <div className="wizard-step-form">
      <div className="wizard-field-group">
        <label>
          Audio File {mode === 'create' && <span className="wizard-required">*</span>}
          {mode === 'edit' && (
            <span className="optional-text">
              {' '}
              (optional - leave empty to keep current file)
            </span>
          )}
        </label>
        <AudioUploadZone
          value={data.file}
          onChange={onFileChange}
          disabled={isLoading}
          isLoading={isLoadingMetadata}
          existingFileLabel={existingAudioLabel}
          ariaLabel="Upload chapter audio file"
        />
        {errors.file && <span className="wizard-field-error">{errors.file}</span>}
      </div>

      {showAudioMetadata && (
        <>
          <div className="wizard-field-group">
            <label>Duration</label>
            <input
              type="text"
              value={formatDurationDetailed(data.duration)}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="wizard-field-group">
            <label htmlFor="chapter-start-position">Start Position (seconds)</label>
            <input
              id="chapter-start-position"
              type="number"
              value={data.startPosition ?? 0}
              onChange={e => {
                const value = parseInt(e.target.value, 10) || 0;
                onChange({ startPosition: value });
              }}
              min={0}
              max={data.duration}
              disabled={isLoading}
            />
          </div>

          <div className="wizard-field-group">
            <label htmlFor="chapter-end-position">End Position (seconds)</label>
            <input
              id="chapter-end-position"
              type="number"
              value={data.endPosition ?? data.duration ?? 0}
              onChange={e => {
                const value = parseInt(e.target.value, 10) || 0;
                onChange({ endPosition: value });
              }}
              min={data.startPosition ?? 0}
              max={data.duration}
              disabled={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ChapterAudioStep;
