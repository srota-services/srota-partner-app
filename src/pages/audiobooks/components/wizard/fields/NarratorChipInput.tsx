import { Mic } from 'lucide-react';
import { useRef, useState } from 'react';
import WizardFieldLabel from '../../../../../components/wizard/WizardFieldLabel';
import CloseButton from '../../../../../components/common/CloseButton';
import '../../../../../styles/pages/audiobooks/components/forms/AudiobookForm.css';

interface NarratorChipInputProps {
  narrators: string[];
  onChange: (narrators: string[]) => void;
  disabled?: boolean;
}

function NarratorChipInput({
  narrators,
  onChange,
  disabled = false,
}: NarratorChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addNarrator = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !narrators.includes(trimmed)) {
      onChange([...narrators, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addNarrator(inputValue);
    } else if (
      e.key === 'Backspace' &&
      inputValue === '' &&
      narrators.length > 0
    ) {
      onChange(narrators.slice(0, -1));
    }
  };

  return (
    <div className="wizard-field-group">
      <WizardFieldLabel htmlFor="audiobook-narrators" icon={Mic}>
        Narrators (optional)
      </WizardFieldLabel>
      <div className="narrators-input-container">
        {narrators.map((narrator, index) => (
          <span key={`${narrator}-${index}`} className="narrator-tag">
            {narrator}
            <CloseButton
              size="sm"
              className="narrator-tag-remove"
              label={`Remove ${narrator}`}
              onClick={() =>
                onChange(narrators.filter((_, i) => i !== index))
              }
              disabled={disabled}
            />
          </span>
        ))}
        <input
          ref={inputRef}
          id="audiobook-narrators"
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            narrators.length === 0
              ? 'Enter narrator name and press Enter or comma'
              : 'Add another narrator...'
          }
          className="narrators-input"
          disabled={disabled}
        />
      </div>
      <p className="wizard-field-hint">
        Press Enter or comma to add a narrator
      </p>
    </div>
  );
}

export default NarratorChipInput;
