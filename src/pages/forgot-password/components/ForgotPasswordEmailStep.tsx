import { FormEvent, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import Button from '../../../components/common/Button';
import FieldErrorHint from '../../../components/common/FieldErrorHint';
import { validateEmail } from '../../../utils/validation';

export interface ForgotPasswordEmailFormData {
  email: string;
}

interface ForgotPasswordEmailStepProps {
  isLoading: boolean;
  initialEmail?: string;
  onSubmit: (data: ForgotPasswordEmailFormData) => void;
  onBack?: () => void;
}

function ForgotPasswordEmailStep({
  isLoading,
  initialEmail = '',
  onSubmit,
  onBack,
}: ForgotPasswordEmailStepProps) {
  const [email, setEmail] = useState(initialEmail);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const trimmed = email.trim();

    if (!trimmed) {
      errors.email = 'Email is required';
    } else if (!validateEmail(trimmed)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit({ email: trimmed });
  };

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <div className="forgot-password-hero">
        <div className="forgot-password-icon" aria-hidden="true">
          <Mail size={24} />
        </div>
        <h2 className="forgot-password-title">Reset your password</h2>
        <p className="forgot-password-subtitle">
          Enter your account email and we&apos;ll send you a verification code.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="forgot-password-email" className="forgot-password-label">
          Email
          <FieldErrorHint message={fieldErrors.email} />
        </label>
        <div className="input-with-icon">
          <Mail size={18} className="input-icon" />
          <input
            id="forgot-password-email"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setFieldErrors({});
            }}
            placeholder="Enter your email"
            disabled={isLoading}
            className={fieldErrors.email ? 'input-error' : ''}
          />
        </div>
      </div>

      <div className="forgot-password-footer">
        {onBack && (
          <button
            type="button"
            className="forgot-password-back-link"
            onClick={onBack}
            disabled={isLoading}
          >
            Back to sign in
          </button>
        )}
        <Button type="submit" className="login-submit-btn" isLoading={isLoading}>
          Send code
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

export default ForgotPasswordEmailStep;
