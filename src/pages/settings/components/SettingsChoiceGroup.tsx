import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

export interface SettingsChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface SettingsChoiceGroupProps<T extends string> {
  name: string;
  options: SettingsChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
  columns?: 2 | 4;
}

function toInputId(groupName: string, value: string): string {
  return `${groupName.replace(/\s+/g, '-').toLowerCase()}-${value}`;
}

function SettingsChoiceGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  disabled = false,
  columns = 2,
}: SettingsChoiceGroupProps<T>) {
  return (
    <div
      className={`settings-choice-group settings-choice-group--cols-${columns}`}
      role="radiogroup"
      aria-label={name}
    >
      {options.map(option => {
        const isSelected = value === option.value;
        const inputId = toInputId(name, option.value);
        const Icon = option.icon;

        return (
          <label
            key={option.value}
            htmlFor={inputId}
            className={`settings-choice-option${
              isSelected ? ' settings-choice-option--selected' : ''
            }`}
          >
            <input
              id={inputId}
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className="settings-choice-input"
            />
            <span className="settings-choice-option-body">
              {Icon && (
                <span className="settings-choice-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
              )}
              <span className="settings-choice-text">
                <span className="settings-choice-label">{option.label}</span>
                {option.description && (
                  <span className="settings-choice-description">
                    {option.description}
                  </span>
                )}
              </span>
            </span>
            {isSelected && (
              <span className="settings-choice-check" aria-hidden="true">
                <Check size={14} />
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export default SettingsChoiceGroup;
