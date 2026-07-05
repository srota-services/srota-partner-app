import { ChangeEvent, DragEvent, useId, useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';
import CloseButton from './CloseButton';
import '../../styles/components/common/FileUploadZone.css';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ACCEPTED_EXTENSIONS = /\.(pdf|docx)$/i;

interface DocumentUploadZoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

function isAcceptedDocument(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) {
    return true;
  }

  if (!file.type && ACCEPTED_EXTENSIONS.test(file.name)) {
    return true;
  }

  return ACCEPTED_EXTENSIONS.test(file.name);
}

function DocumentUploadZone({
  value,
  onChange,
  disabled = false,
  ariaLabel = 'Upload document',
}: DocumentUploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const validateAndSet = (file: File | null) => {
    setError('');
    if (!file) {
      onChange(null);
      return;
    }
    if (!isAcceptedDocument(file)) {
      setError('Please upload a PDF or DOCX file');
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

  const clearFile = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-zone">
      <label
        htmlFor={inputId}
        className={`image-upload-dropzone${dragOver ? ' image-upload-dropzone--active' : ''}${disabled ? ' image-upload-dropzone--disabled' : ''}`}
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
        <CloudUpload size={28} className="image-upload-icon" />
        <p className="image-upload-text">
          Drag &amp; drop your file here or{' '}
          <span className="image-upload-link">click to browse</span>
        </p>
        <p className="image-upload-hint">PDF or DOCX · One file only</p>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="image-upload-input"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>

      {value && (
        <div className="image-upload-selected">
          <span className="image-upload-selected-name">{value.name}</span>
          <CloseButton
            size="sm"
            className="image-upload-selected-remove"
            label="Remove file"
            onClick={event => {
              event.stopPropagation();
              clearFile();
            }}
            disabled={disabled}
          />
        </div>
      )}

      {error && <span className="upload-zone-error">{error}</span>}
    </div>
  );
}

export default DocumentUploadZone;
