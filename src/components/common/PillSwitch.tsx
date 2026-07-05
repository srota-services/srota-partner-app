import '../../styles/components/common/PillSwitch.css';

interface PillSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  id?: string;
  hideLabel?: boolean;
}

function PillSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  hideLabel = false,
}: PillSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`pill-switch${checked ? ' pill-switch--checked' : ''}${hideLabel ? ' pill-switch--compact' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="pill-switch-thumb" aria-hidden="true" />
      {!hideLabel && <span className="pill-switch-text">{label}</span>}
    </button>
  );
}

export default PillSwitch;
