import { ChangeEvent, DragEvent, useId, useRef, useState } from 'react';
import { Headphones } from 'lucide-react';
import CloseButton from './CloseButton';
import '../../styles/components/common/FileUploadZone.css';

const ACCEPTED_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/flac',
  'audio/x-flac',
];

const ACCEPTED_EXTENSIONS = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

interface AudioUploadZoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  isLoading?: boolean;
  existingFileLabel?: string | null;
  ariaLabel?: string;
}

function isAcceptedAudio(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) {
    return true;
  }

  if (!file.type && ACCEPTED_EXTENSIONS.test(file.name)) {
    return true;
  }

  return ACCEPTED_EXTENSIONS.test(file.name);
}

function AudioUploadZone({
  value,
  onChange,
  disabled = false,
  isLoading = false,
  existingFileLabel = null,
  ariaLabel = 'Upload audio file',
}: AudioUploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const isDisabled = disabled || isLoading;

  const validateAndSet = (file: File | null) => {
    setError('');
    if (!file) {
      onChange(null);
      return;
    }
    if (!isAcceptedAudio(file)) {
      setError('Please upload MP3, WAV, OGG, M4A, AAC, or FLAC audio');
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
    if (isDisabled) {
      return;
    }
    const file = event.dataTransfer.files?.[0] ?? null;
    validateAndSet(file);
  };

  const clearFile = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="audio-upload-zone">
      <label
        htmlFor={inputId}
        className={`audio-upload-dropzone${dragOver ? ' audio-upload-dropzone--active' : ''}${isDisabled ? ' audio-upload-dropzone--disabled' : ''}`}
        onDragOver={event => {
          event.preventDefault();
          if (!isDisabled) {
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        aria-label={ariaLabel}
      >
        <Headphones size={28} className="audio-upload-icon" />
        <p className="audio-upload-text">
          Drag &amp; drop your audio here or{' '}
          <span className="audio-upload-link">click to browse</span>
        </p>
        <p className="audio-upload-hint">MP3, WAV, OGG, M4A, AAC, or FLAC</p>
        {isLoading && (
          <p className="audio-upload-loading">Loading audio metadata...</p>
        )}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.m4a,.aac,.flac,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/aac,audio/flac"
          className="audio-upload-input"
          onChange={handleFileChange}
          disabled={isDisabled}
        />
      </label>

      {value && (
        <div className="audio-upload-selected">
          <span className="audio-upload-selected-name">{value.name}</span>
          <CloseButton
            size="sm"
            className="audio-upload-selected-remove"
            label="Remove audio file"
            onClick={event => {
              event.stopPropagation();
              clearFile();
            }}
            disabled={isDisabled}
          />
        </div>
      )}

      {!value && existingFileLabel && (
        <div className="audio-upload-selected audio-upload-selected--existing">
          <span className="audio-upload-selected-name">{existingFileLabel}</span>
        </div>
      )}

      {error && <span className="upload-zone-error">{error}</span>}
    </div>
  );
}

export default AudioUploadZone;
