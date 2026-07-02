/**
 * Shared close ("cross") button used across the app for consistent look and
 * behavior: a neutral icon button with a subtle hover background, focus ring,
 * and an accessible label. Use size="sm" for inline chip/remove buttons and
 * size="md" (default) for dialogs, panels, and toasts.
 */
import React from 'react';
import { X } from 'lucide-react';
import '../../styles/components/common/CloseButton.css';

interface CloseButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'children' | 'type'
  > {
  size?: 'sm' | 'md';
  /** Accessible label; defaults to "Close". */
  label?: string;
}

const ICON_SIZE: Record<NonNullable<CloseButtonProps['size']>, number> = {
  sm: 14,
  md: 18,
};

const CloseButton: React.FC<CloseButtonProps> = ({
  size = 'md',
  label = 'Close',
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`close-button close-button--${size} ${className}`.trim()}
      aria-label={label}
      {...props}
    >
      <X size={ICON_SIZE[size]} aria-hidden="true" />
    </button>
  );
};

export default CloseButton;
