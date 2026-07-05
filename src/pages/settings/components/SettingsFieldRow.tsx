import type { ReactNode } from 'react';
import Button from '../../../components/common/Button';

interface SettingsFieldRowProps {
  label: string;
  hint?: string;
  children: ReactNode;
  showSave?: boolean;
  canSave?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  saveLabel?: string;
}

function SettingsFieldRow({
  label,
  hint,
  children,
  showSave = false,
  canSave = false,
  isSaving = false,
  onSave,
  saveLabel = 'Save',
}: SettingsFieldRowProps) {
  return (
    <div className="settings-field-row marketing-card">
      <div className="settings-field-row-header">
        <label className="settings-field-label">{label}</label>
        {showSave && onSave && (
          <Button
            type="button"
            variant="outline"
            size="small"
            disabled={!canSave || isSaving}
            isLoading={isSaving}
            onClick={onSave}
          >
            {saveLabel}
          </Button>
        )}
      </div>
      <div className="settings-field-control">{children}</div>
      {hint && <p className="settings-field-hint">{hint}</p>}
    </div>
  );
}

export default SettingsFieldRow;
