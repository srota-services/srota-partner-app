import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Fingerprint, Lock, Mail, Shield } from 'lucide-react';
import { useAppDispatch } from '../../../hooks/redux';
import { login } from '../../../utils/api';
import { setAuthenticated } from '../../../utils/auth';
import { ensureCsrfToken } from '../../../utils/csrf';
import { getBrowserDeviceInfo } from '../../../utils/device';
import {
  setAuthenticated as setAuthRedux,
  setUserRole,
  setUser,
  setAppType,
  setWorkspaceSlug,
} from '../../../store/slices/authSlice';
import { getUserRoleFromAuthResponse } from '../../../utils/authRole';
import {
  getStoredWorkspaceSlug,
  setStoredWorkspaceSlug,
} from '../../../utils/workspaceSlug';
import {
  clearStoredAppType,
  setStoredAppType,
} from '../../../utils/workspaceAppType';
import type { LoginRequest, LoginResponse } from '../../../types/auth';
import { showApiError } from '../../../utils/toast';
import { validateEmail } from '../../../utils/validation';
import Button from '../../../components/common/Button';
import InfoHint from '../../../components/common/InfoHint';

const IDENTIFIER_HINT =
  'Organization members: Use your organization identifier. Authors: Use your author identifier.';

function LoginFormPanel() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slug, setSlug] = useState(() => getStoredWorkspaceSlug());
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!email || !password) {
      setEmailError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await ensureCsrfToken();
      const loginData: LoginRequest = {
        email: email.trim(),
        password,
        clientType: 'browser',
        device: getBrowserDeviceInfo(),
      };
      const trimmedSlug = slug.trim();
      if (trimmedSlug) {
        loginData.slug = trimmedSlug;
      }

      const loginResponse: LoginResponse = await login(loginData);
      setAuthenticated(true);
      dispatch(setAuthRedux(true));
      const role = getUserRoleFromAuthResponse(loginResponse);
      if (role) {
        dispatch(setUserRole(role));
      }
      if (loginResponse.appType) {
        setStoredAppType(loginResponse.appType);
        dispatch(setAppType(loginResponse.appType));
      } else {
        clearStoredAppType();
        dispatch(setAppType(null));
      }
      if (trimmedSlug) {
        setStoredWorkspaceSlug(trimmedSlug);
        dispatch(setWorkspaceSlug(trimmedSlug));
      } else {
        dispatch(setWorkspaceSlug(null));
      }
      if (loginResponse.user) {
        dispatch(
          setUser({
            id: loginResponse.user.id,
            email: loginResponse.user.email,
            name: loginResponse.user.name,
          })
        );
      } else {
        dispatch(setUser({ email: email.trim() }));
      }
      navigate('/audiobooks', { replace: true });
    } catch (err) {
      showApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login-panel">
      <div className="login-form-card marketing-card">
        <div className="login-form-icon">
          <Lock size={24} />
        </div>
        <h2 className="login-form-title">Welcome back</h2>
        <p className="login-form-subtitle">
          Sign in to manage your Srota catalog
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="login-form-label-row">
              <label htmlFor="identifier">Identifier</label>
              <InfoHint message={IDENTIFIER_HINT} />
            </div>
            <div className="input-with-icon">
              <Fingerprint size={18} className="input-icon" />
              <input
                id="identifier"
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="Organization or author slug"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="Enter your email"
                disabled={isLoading}
                className={emailError ? 'input-error' : ''}
              />
            </div>
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span className="remember-me-text">Remember me</span>
            </label>
            <button type="button" className="forgot-password">
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="login-submit-btn" isLoading={isLoading}>
            Log in
          </Button>
        </form>

        <div className="login-secure-divider">
          <span />
          <Shield size={14} />
          <span>Secure partner access</span>
          <span />
        </div>

        <button
          type="button"
          className="back-to-website"
          onClick={() => navigate('/')}
        >
          Back to website →
        </button>
      </div>
    </section>
  );
}

export default LoginFormPanel;
