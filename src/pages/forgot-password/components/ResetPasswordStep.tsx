import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import Button from '../../../components/common/Button';
import FieldErrorHint from '../../../components/common/FieldErrorHint';
import InfoBanner from '../../../components/common/InfoBanner';
import PasswordStrengthIndicator from '../../../components/common/PasswordStrengthIndicator';
import { isPasswordStrongEnough } from '../../../utils/passwordStrength';

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordStepProps {
  email: string;
  isLoading: boolean;
  serverError?: string;
  onSubmit: (data: ResetPasswordFormData) => void;
  onBack?: () => void;
}

function ResetPasswordStep({
  email,
  isLoading,
  serverError,
  onSubmit,
  onBack,
}: ResetPasswordStepProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    if (!isPasswordStrongEnough(newPassword)) {
      errors.newPassword = 'Please create a stronger password';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit({ newPassword, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <div className="forgot-password-hero">
        <div className="forgot-password-icon" aria-hidden="true">
          <Lock size={24} />
        </div>
        <h2 className="forgot-password-title">Create a new password</h2>
        <p className="forgot-password-subtitle">
          Choose a strong password for <strong>{email}</strong>
        </p>
      </div>

      {serverError && (
        <p className="forgot-password-server-error" role="alert">
          {serverError}
        </p>
      )}

      <div className="form-group">
        <label htmlFor="reset-new-password" className="forgot-password-label">
          New password
          <FieldErrorHint message={fieldErrors.newPassword} />
        </label>
        <div className="input-with-icon">
          <Lock size={18} className="input-icon" />
          <input
            id="reset-new-password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => {
              setNewPassword(e.target.value);
              setFieldErrors(prev => {
                const next = { ...prev };
                delete next.newPassword;
                return next;
              });
            }}
            placeholder="Enter a new password"
            disabled={isLoading}
            className={fieldErrors.newPassword ? 'input-error' : ''}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(current => !current)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <PasswordStrengthIndicator password={newPassword} />
      </div>

      <div className="form-group">
        <label htmlFor="reset-confirm-password" className="forgot-password-label">
          Confirm password
          <FieldErrorHint message={fieldErrors.confirmPassword} />
        </label>
        <div className="input-with-icon">
          <Lock size={18} className="input-icon" />
          <input
            id="reset-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value);
              setFieldErrors(prev => {
                const next = { ...prev };
                delete next.confirmPassword;
                return next;
              });
            }}
            placeholder="Re-enter your new password"
            disabled={isLoading}
            className={fieldErrors.confirmPassword ? 'input-error' : ''}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(current => !current)}
            aria-label={
              showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
            }
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <InfoBanner icon={Shield} compact>
        Your new password will replace your current one. All active sessions will
        be signed out.
      </InfoBanner>

      <div className="forgot-password-footer">
        {onBack && (
          <button
            type="button"
            className="forgot-password-back-link"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
        )}
        <Button type="submit" className="login-submit-btn" isLoading={isLoading}>
          Reset password
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

export default ResetPasswordStep;
