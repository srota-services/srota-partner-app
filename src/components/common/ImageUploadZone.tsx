import { ChangeEvent, DragEvent, useId, useRef, useState } from 'react';
import { CloudUpload, X } from 'lucide-react';
import { useFilePreviewUrl } from '../../hooks/useFilePreviewUrl';
import '../../styles/components/common/FileUploadZone.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ImageUploadZoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  previewUrl?: string | null;
  onClearExisting?: () => void;
  compact?: boolean;
  showPreview?: boolean;
  ariaLabel?: string;
  recommendedSizeHint?: string;
}

function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) {
    return true;
  }

  if (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name)) {
    return true;
  }

  return false;
}

function buildHintText(compact: boolean, recommendedSizeHint?: string): string | null {
  if (compact) {
    return null;
  }

  if (recommendedSizeHint) {
    return `Recommended size: ${recommendedSizeHint} · JPG, PNG, or WebP · Max 5 MB`;
  }

  return 'Recommended: Square JPG, PNG (512×512) · Max 5 MB';
}

function ImageUploadZone({
  value,
  onChange,
  disabled = false,
  previewUrl,
  onClearExisting,
  compact = false,
  showPreview = true,
  ariaLabel = 'Upload image',
  recommendedSizeHint,
}: ImageUploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const hintText = buildHintText(compact, recommendedSizeHint);

  const validateAndSet = (file: File | null) => {
    setError('');
    if (!file) {
      onChange(null);
      return;
    }
    if (!isAcceptedImage(file)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be smaller than 5 MB');
      return;
    }
    onChange(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    validateAndSet(file);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) {
      return;
    }
    const file = event.dataTransfer.files?.[0] ?? null;
    validateAndSet(file);
  };

  const localPreviewUrl = useFilePreviewUrl(
    showPreview && !previewUrl ? value : null
  );
  const objectPreview = showPreview ? (previewUrl ?? localPreviewUrl) : null;
  const isExistingPreview = Boolean(objectPreview && previewUrl && !value);

  const clearFile = () => {
    if (isExistingPreview && onClearExisting) {
      onClearExisting();
      return;
    }

    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload-zone${compact ? ' image-upload-zone--compact' : ''}`}>
      <label
        htmlFor={inputId}
        className={`image-upload-dropzone${compact ? ' image-upload-dropzone--compact' : ''}${dragOver ? ' image-upload-dropzone--active' : ''}${disabled ? ' image-upload-dropzone--disabled' : ''}`}
        onDragOver={event => {
          event.preventDefault();
          if (!disabled) {
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        aria-label={ariaLabel}
      >
        <CloudUpload size={compact ? 22 : 28} className="image-upload-icon" />
        <p className="image-upload-text">
          {compact ? (
            <>
              <span className="image-upload-link">Click to browse</span> or drag
              &amp; drop
            </>
          ) : (
            <>
              Drag &amp; drop your image here or{' '}
              <span className="image-upload-link">click to browse</span>
            </>
          )}
        </p>
        {hintText && <p className="image-upload-hint">{hintText}</p>}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="image-upload-input"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>

      {objectPreview && (
        <div className="image-upload-preview">
          <img src={objectPreview} alt="Uploaded image preview" />
          <button
            type="button"
            className="image-upload-remove"
            onClick={event => {
              event.stopPropagation();
              clearFile();
            }}
            disabled={disabled}
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {!showPreview && value && (
        <div className="image-upload-selected">
          <span className="image-upload-selected-name">{value.name}</span>
          <button
            type="button"
            className="image-upload-selected-remove"
            onClick={event => {
              event.stopPropagation();
              clearFile();
            }}
            disabled={disabled}
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && <span className="upload-zone-error">{error}</span>}
    </div>
  );
}

export default ImageUploadZone;
