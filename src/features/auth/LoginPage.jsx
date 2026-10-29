import { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from './useAuth';

export function LoginPage() {
  const { 
    signInWithPassword, 
    signInAsDemo, 
    signUp, 
    authError 
  } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const isSignUp = mode === 'signup';

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setLocalError('Please provide your full name for staff profile creation.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const res = await signUp(email, password, fullName);
        if (!res.success) {
          setLocalError(res.error || 'Failed to register account.');
        }
      } else {
        const res = await signInWithPassword(email, password);
        if (!res.success) {
          setLocalError(res.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setLocalError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoLogin(roleType) {
    setLocalError(null);
    signInAsDemo(roleType);
  }

  const activeError = localError || authError;

  return (
    <div className="login-page-container">
      {/* Background Decorative Ambient Glows */}
      <div className="login-ambient-orb orb-1"></div>
      <div className="login-ambient-orb orb-2"></div>
      <div className="login-ambient-orb orb-3"></div>

      <div className="login-wrapper">
        {/* Left Side: Brand Hero & Admissions Value Prop */}
        <div className="login-hero-pane">
          <div className="login-brand-header">
            <div className="login-logo-badge">
              <span>B</span>
            </div>
            <div>
              <h1 className="login-brand-title">BrightPath</h1>
              <span className="login-brand-sub">ACADEMY CRM</span>
            </div>
          </div>

          <div className="login-hero-content">
            <div className="login-hero-chip">
              <Sparkles size={14} className="chip-sparkle" />
              <span>Admissions Intelligence & Student Management</span>
            </div>

            <h2 className="login-hero-headline">
              Empowering Education Admissions & Counselling Operations
            </h2>

            <p className="login-hero-desc">
              All student enquiries, counselor follow-ups, and admissions pipeline stages organized in one secure workspace. Sign in to access live records.
            </p>

            {/* Feature Highlights */}
            <div className="login-features-list">
              <div className="login-feature-item">
                <div className="feature-icon-box blue">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <strong>Student Enquiry Pipeline</strong>
                  <p>Centralized tracking for website, walk-ins, and counselor referrals.</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon-box amber">
                  <Clock size={18} />
                </div>
                <div>
                  <strong>Automated Overdue Detection</strong>
                  <p>Never let a student callback drop with smart urgency indicators.</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon-box green">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <strong>Conversion & Analytics</strong>
                  <p>Real-time enrollment rates, counselor workload, and course demand.</p>
                </div>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="login-trust-badge">
              <ShieldCheck size={16} className="trust-shield" />
              <span>Protected by PostgreSQL Row Level Security (RLS) & JWT authentication.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="login-form-pane">
          <div className="login-card">
            <div className="login-card-head">
              <div className="login-mobile-brand">
                <div className="auth-brand-badge">
                  <span>B</span>
                </div>
                <div>
                  <strong>BrightPath Academy</strong>
                  <span>CRM Workspace</span>
                </div>
              </div>
              <h3 className="login-form-title">
                {isSignUp ? 'Create Staff Account' : 'Staff Sign In'}
              </h3>
              <p className="login-form-subtitle">
                {isSignUp 
                  ? 'Register new counsellor or staff credentials to begin.' 
                  : 'Enter your academy credentials to access the CRM portal.'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="auth-tab-bar" style={{ marginBottom: '20px' }}>
              <button
                type="button"
                className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
                onClick={() => {
                  setMode('signin');
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
                  setMode('signup');
                  setLocalError(null);
                }}
              >
                <UserPlus size={15} />
                <span>Register Staff</span>
              </button>
            </div>

            {/* Error Banner */}
            {activeError && (
              <div className="auth-error-banner shake-animation" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{activeError}</span>
              </div>
            )}

            {/* Auth Form */}
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

              <div className="auth-actions" style={{ marginTop: '4px' }}>
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
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Access Divider */}
            <div className="login-divider">
              <span>OR INSTANT DEMO ACCESS</span>
            </div>

            {/* Quick 1-Click Demo Buttons */}
            <div className="demo-login-section">
              <p className="demo-notice">
                Select a pre-configured role to immediately test and explore the CRM:
              </p>
              
              <div className="demo-buttons-grid">
                <button
                  type="button"
                  className="demo-btn counsellor-btn"
                  onClick={() => handleDemoLogin('counsellor')}
                  title="Sign in as Priya Sharma"
                >
                  <div className="demo-btn-avatar">PS</div>
                  <div className="demo-btn-text">
                    <strong>Priya Sharma</strong>
                    <span>Counsellor Role</span>
                  </div>
                  <CheckCircle2 size={15} className="demo-check-icon" />
                </button>

                <button
                  type="button"
                  className="demo-btn admin-btn"
                  onClick={() => handleDemoLogin('admin')}
                  title="Sign in as Arishit Thakkar"
                >
                  <div className="demo-btn-avatar admin">AT</div>
                  <div className="demo-btn-text">
                    <strong>Arishit Thakkar</strong>
                    <span>Admin Role</span>
                  </div>
                  <CheckCircle2 size={15} className="demo-check-icon" />
                </button>
              </div>
            </div>

            <div className="login-footer-security">
              <ShieldCheck size={13} />
              <span>BrightPath CRM v1.0 • Staff Authentication Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
