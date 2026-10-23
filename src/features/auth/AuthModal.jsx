import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from './useAuth';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    setAuthModalMode,
    signInWithPassword,
    signUp,
    authError 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (!isAuthModalOpen) return null;

  const isSignUp = authModalMode === 'signup';

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setLocalError('Please enter your full name for staff profile creation.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    if (isSignUp) {
      const res = await signUp(email, password, fullName);
      setIsSubmitting(false);
      if (!res.success) {
        setLocalError(res.error);
      }
    } else {
      const res = await signInWithPassword(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setLocalError(res.error);
      }
    }
  }

  const activeError = localError || authError;

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div 
        className="modal-card auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="auth-modal-head">
          <div className="auth-brand-badge">
            <span>B</span>
          </div>
          <div>
            <h2>BrightPath Academy CRM</h2>
            <p>Secure Staff & Admissions Authentication</p>
          </div>
          <button 
            className="close-button" 
            onClick={closeAuthModal} 
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setAuthModalMode('signin');
              setLocalError(null);
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setAuthModalMode('signup');
              setLocalError(null);
            }}
          >
            <UserPlus size={15} />
            <span>Register Staff</span>
          </button>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="auth-error-banner shake-animation">
            <AlertCircle size={16} />
            <span>{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <label className="auth-field-label">
              <span>Full Name *</span>
              <div className="auth-input-wrap">
                <User size={16} className="auth-field-icon" />
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="auth-input"
                  autoFocus
                />
              </div>
            </label>
          )}

          <label className="auth-field-label">
            <span>Staff Email Address *</span>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-field-icon" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@brightpath.edu"
                className="auth-input"
                autoFocus={!isSignUp}
              />
            </div>
          </label>

          <label className="auth-field-label">
            <span>Password *</span>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-field-icon" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
              />
              <button
                type="button"
                className="toggle-pw-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          <div className="auth-security-notice">
            <Shield size={13} />
            <span>
              {isSignUp 
                ? 'New accounts default to Counsellor permissions per academy security policy.'
                : 'Protected by Supabase Row Level Security (RLS).'}
            </span>
          </div>

          <div className="auth-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button auth-submit-btn"
            >
              {isSubmitting ? (
                <span className="spinner-loader"></span>
              ) : isSignUp ? (
                <>
                  <UserPlus size={16} />
                  <span>Create Counsellor Account</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In to CRM</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
