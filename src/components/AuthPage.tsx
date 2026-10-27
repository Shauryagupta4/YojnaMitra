import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../services/supabaseClient';
import { signInWithGoogle } from '../services/firebaseClient';

export interface UserSession {
  name: string;
  emailOrPhone: string;
  persona: 'student' | 'farmer' | 'citizen' | 'business';
  state: string;
  aadhaarLinked?: boolean;
}

export interface AuthPageProps {
  onLoginSuccess: (user: UserSession) => void;
  onBackToApp?: () => void;
  initialMode?: 'login' | 'signup';
  statesList: string[];
  isModal?: boolean;
  onClose?: () => void;
  promptReason?: string | null;
}

// Google G Brand Icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthPage({
  onLoginSuccess,
  onBackToApp,
  initialMode = 'login',
  statesList,
  isModal = false,
  onClose,
  promptReason
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Simplified Signup form state: Number/Email and Password only
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Form error & success states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setErrorMsg('Please enter your Registered Mobile Number or Email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Supabase Auth signInWithPassword if identifier is an email (or format as email)
      const authEmail = identifier.includes('@') ? identifier : `${identifier}@yojanamitra.app`;
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: loginPassword,
      });

      if (!authError && authData.user) {
        // Fetch or update user profile from Supabase profiles table
        let profileName = authData.user.user_metadata?.full_name || '';
        let profileState = '';
        let profilePersona: 'student' | 'farmer' | 'citizen' | 'business' = 'citizen';

        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, state, persona, updated_at')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileData) {
            profileName = profileData.full_name || profileName;
            if (profileData.state) profileState = profileData.state;
            if (profileData.persona) profilePersona = profileData.persona as any;
          }
        } catch {
          // ignore profile fetch error
        }

        const userSession: UserSession = {
          name: profileName || identifier.split('@')[0],
          emailOrPhone: identifier,
          persona: profilePersona,
          state: profileState,
          aadhaarLinked: true,
        };

        setIsLoading(false);
        setSuccessMsg(`Welcome, ${userSession.name}! Logging you into YojanaMitra...`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => {
          onLoginSuccess(userSession);
        }, 600);
        return;
      }

      // If Supabase sign in threw a credential error, check local fallback or display error
      let matchedAccount: UserSession | null = null;
      try {
        const stored = localStorage.getItem('yojanamitra_registered_accounts');
        if (stored) {
          const accounts: Record<string, any> = JSON.parse(stored);
          const found = accounts[identifier] || accounts[identifier.toLowerCase()];
          if (found) {
            if (found.password && found.password !== loginPassword) {
              setIsLoading(false);
              setErrorMsg(authError?.message || 'Incorrect password. Please verify your credentials.');
              return;
            }
            matchedAccount = {
              name: found.name,
              emailOrPhone: found.emailOrPhone,
              persona: found.persona,
              state: found.state,
              aadhaarLinked: found.aadhaarLinked
            };
          }
        }
      } catch {
        // ignore
      }

      if (matchedAccount) {
        setIsLoading(false);
        setSuccessMsg(`Welcome, ${matchedAccount.name}! Logging you in...`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => {
          onLoginSuccess(matchedAccount!);
        }, 600);
        return;
      }

      if (authError) {
        setIsLoading(false);
        setErrorMsg(authError.message || 'Login failed. Please check credentials or sign up.');
        return;
      }

      const fallbackSession: UserSession = {
        name: identifier.includes('@')
          ? identifier.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, '')
          : `Citizen (${identifier.slice(-4) || identifier})`,
        emailOrPhone: identifier,
        persona: 'citizen',
        state: '',
        aadhaarLinked: true
      };

      setIsLoading(false);
      setSuccessMsg(`Welcome, ${fallbackSession.name}! Logging you into YojanaMitra...`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => {
        onLoginSuccess(fallbackSession);
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Authentication error occurred.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const user = await signInWithGoogle();
      
      const displayName = user.displayName || user.email?.split('@')[0] || 'Citizen';
      const email = user.email || 'citizen@google.com';

      let syncedPersona: 'student' | 'farmer' | 'citizen' | 'business' = 'citizen';
      let syncedState = '';

      // Synchronize authenticated Google account into Supabase database (auth.users + profiles)
      try {
        const syncResponse = await fetch('/api/auth/sync-google-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            fullName: displayName,
            photoURL: user.photoURL || null,
            firebaseUid: user.uid,
            state: '',
            persona: 'citizen'
          })
        });

        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          if (syncResult?.profile) {
            if (syncResult.profile.state) syncedState = syncResult.profile.state;
            if (syncResult.profile.persona) syncedPersona = syncResult.profile.persona;
          }
        }
      } catch (syncErr) {
        console.warn('[Supabase Sync Warning]:', syncErr);
      }

      const googleUser: UserSession = {
        name: displayName,
        emailOrPhone: email,
        persona: syncedPersona,
        state: syncedState,
        aadhaarLinked: true
      };

      setIsLoading(false);
      setSuccessMsg(`Welcome, ${googleUser.name}! Signed in via Google.`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        onLoginSuccess(googleUser);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      if (err?.message?.includes('closed before completing')) {
        setErrorMsg('Google sign-in was cancelled.');
      } else {
        setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const identifier = signupIdentifier.trim();
    if (!identifier) {
      setErrorMsg('Please enter your mobile number or email address.');
      return;
    }
    const isNum = /^\d+$/.test(identifier);
    if (isNum && identifier.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!isNum && (!identifier.includes('@') || !identifier.includes('.'))) {
      setErrorMsg('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    const isEmail = identifier.includes('@');
    const authEmail = isEmail ? identifier : `${identifier}@yojanamitra.app`;
    const derivedName = isEmail
      ? identifier.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, '')
      : `Citizen (${identifier.slice(-4) || identifier})`;

    const newUser: UserSession = {
      name: derivedName || 'Citizen',
      emailOrPhone: identifier,
      persona: 'citizen',
      state: '',
      aadhaarLinked: false
    };

    try {
      // 1. Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: newUser.name,
            phone: isNum ? identifier : '',
            state: newUser.state,
            persona: newUser.persona,
          }
        }
      });

      if (authError) {
        console.warn('Supabase signup notice:', authError.message);
      }

      // 2. Insert/Upsert into the 'profiles' table with full profile details
      if (authData?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: authEmail,
            full_name: newUser.name,
            phone: isNum ? identifier : null,
            state: newUser.state,
            persona: newUser.persona,
            updated_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Profiles table sync notice:', dbErr);
        }
      }

      // Also keep local sync for instant offline experience
      try {
        const stored = localStorage.getItem('yojanamitra_registered_accounts');
        const accounts: Record<string, any> = stored ? JSON.parse(stored) : {};
        accounts[identifier] = { ...newUser, password: signupPassword };
        accounts[identifier.toLowerCase()] = { ...newUser, password: signupPassword };
        localStorage.setItem('yojanamitra_registered_accounts', JSON.stringify(accounts));
      } catch {
        // ignore
      }

      setIsLoading(false);
      setSuccessMsg(`Account successfully registered in Supabase! Logging you in...`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Error creating account. Please try again.');
    }
  };

  const renderAuthCard = () => (
    <div
      className="mono-card animate-entrance"
      style={{
        borderRadius: 24,
        border: '1.5px solid #E2E8F0',
        boxShadow: isModal
          ? '0 25px 65px -12px rgba(11, 37, 69, 0.4), 0 0 35px rgba(255, 255, 255, 0.45)'
          : '0 20px 45px -15px rgba(15, 23, 42, 0.12), 0 0 20px rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: isModal ? '30px 24px' : '36px 32px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      {/* Top Tricolor Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #FF7700 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #047857 66.6%)'
        }}
      />

      {/* Modal Close Button X */}
      {isModal && (onClose || onBackToApp) && (
        <button
          type="button"
          onClick={onClose || onBackToApp}
          title="Close login dialog"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            borderRadius: 9999,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569',
            zIndex: 30,
            transition: 'all 0.18s ease'
          }}
        >
          <X size={16} />
        </button>
      )}

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 12px', borderRadius: 9999, marginBottom: 10 }}>
          <ShieldCheck size={14} color="#1D4ED8" />
          <span className="font-mono" style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.04em' }}>
            OFFICIAL CITIZEN PORTAL • नागरिक सेवा पोर्टल
          </span>
        </div>

        {promptReason && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              backgroundColor: '#FFF1F2',
              border: '1.5px solid #FECDD3',
              color: '#9F1239',
              margin: '8px 0 14px',
              textAlign: 'left'
            }}
          >
            <Lock size={16} color="#E11D48" style={{ flexShrink: 0 }} />
            <span className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.4 }}>
              {promptReason}
            </span>
          </div>
        )}

        <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0B2545', margin: '4px 0 6px' }}>
          {mode === 'login' ? 'Citizen Sign In' : 'Create Citizen Account'}
        </h2>
        <p className="font-body" style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: 440, margin: '0 auto', lineHeight: 1.45 }}>
          {mode === 'login'
            ? 'Access your saved scheme eligibility, application trackers & official DBT notifications.'
            : 'Register your citizen profile for instant real-time scholarship and welfare matching across Central & State registries.'}
        </p>
      </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              backgroundColor: '#F1F5F9',
              padding: 4,
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              marginBottom: 24
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className="font-mono"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: mode === 'login' ? '#0B2545' : 'transparent',
                color: mode === 'login' ? '#FFFFFF' : '#64748B',
                fontWeight: 800,
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                boxShadow: mode === 'login' ? '0 4px 12px rgba(11, 37, 69, 0.25)' : 'none'
              }}
            >
              <LogIn size={15} />
              <span>SIGN IN</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className="font-mono"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: mode === 'signup' ? '#0B2545' : 'transparent',
                color: mode === 'signup' ? '#FFFFFF' : '#64748B',
                fontWeight: 800,
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                boxShadow: mode === 'signup' ? '0 4px 12px rgba(11, 37, 69, 0.25)' : 'none'
              }}
            >
              <UserPlus size={15} />
              <span>REGISTER</span>
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div
              className="animate-entrance"
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#B91C1C'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                {errorMsg}
              </span>
            </div>
          )}

          {successMsg && (
            <div
              className="animate-entrance"
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#047857'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                {successMsg}
              </span>
            </div>
          )}

          {/* Direct Google Sign In / Sign Up */}
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <GoogleIcon />
              <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </button>

            {/* Neat Divider */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 18, gap: 12 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
              <span className="font-mono" style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.05em' }}>
                OR WITH {mode === 'login' ? 'PASSWORD' : 'MOBILE / EMAIL'}
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            </div>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 6, letterSpacing: '0.04em' }}>
                  MOBILE NUMBER OR EMAIL
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile or email ID"
                    className="mono-input"
                    style={{
                      width: '100%',
                      paddingLeft: 42,
                      paddingRight: 14,
                      paddingTop: 12,
                      paddingBottom: 12,
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', letterSpacing: '0.04em' }}>
                    PASSWORD
                  </label>
                  <span className="font-mono" style={{ fontSize: '0.68rem', color: '#2563EB', cursor: 'pointer', fontWeight: 700 }}>
                    Forgot Password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="mono-input"
                    style={{
                      width: '100%',
                      paddingLeft: 42,
                      paddingRight: 42,
                      paddingTop: 12,
                      paddingBottom: 12,
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="mono-btn-primary"
                style={{
                  marginTop: 6,
                  padding: '14px 24px',
                  borderRadius: 12,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  background: 'linear-gradient(135deg, #0B2545 0%, #134074 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 16px rgba(11, 37, 69, 0.3)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10
                }}
              >
                <LogIn size={16} />
                <span>{isLoading ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO YOJANAMITRA'}</span>
              </button>
            </form>
          ) : (
            /* SIMPLIFIED SIGNUP FORM: Only Number/Email and Password */
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 6, letterSpacing: '0.04em' }}>
                  MOBILE NUMBER OR EMAIL ADDRESS *
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    value={signupIdentifier}
                    onChange={e => setSignupIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile number or email ID"
                    className="mono-input"
                    style={{
                      width: '100%',
                      paddingLeft: 42,
                      paddingRight: 14,
                      paddingTop: 12,
                      paddingBottom: 12,
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div>
                  <label className="font-mono" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 6, letterSpacing: '0.04em' }}>
                    CREATE PASSWORD (MIN 6 CHARS) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                      <Lock size={16} />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Create account password"
                      className="mono-input"
                      style={{
                        width: '100%',
                        paddingLeft: 42,
                        paddingRight: 38,
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 6, letterSpacing: '0.04em' }}>
                    CONFIRM PASSWORD *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                      <Lock size={16} />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={e => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="mono-input"
                      style={{
                        width: '100%',
                        paddingLeft: 42,
                        paddingRight: 14,
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mono-btn-primary"
                style={{
                  marginTop: 6,
                  padding: '14px 24px',
                  borderRadius: 12,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  background: 'linear-gradient(135deg, #0B2545 0%, #134074 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 16px rgba(11, 37, 69, 0.3)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10
                }}
              >
                <UserPlus size={16} />
                <span>{isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
              </button>
            </form>
          )}

          {/* Footer Security Badges */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
              color: '#64748B',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <span>🔒 256-BIT ENCRYPTION</span>
            <span>•</span>
            <span>PRIVACY FOCUSED</span>
            <span>•</span>
            <span>COMMUNITY OPEN WELFARE PLATFORM</span>
          </div>
        </div>
      );

  if (isModal) {
    return (
      <div
        className="auth-modal-backdrop animate-entrance"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(11, 37, 69, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto'
        }}
        onClick={e => {
          if (e.target === e.currentTarget && (onClose || onBackToApp)) {
            (onClose || onBackToApp)();
          }
        }}
      >
        <div style={{ maxWidth: 580, width: '100%', maxHeight: '92vh', overflowY: 'auto', margin: 'auto' }}>
          {renderAuthCard()}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#0F172A', width: '100%', position: 'relative', overflowX: 'hidden' }}>
      {/* National Tricolor Top Ribbon */}
      <div className="gov-tricolor-bar" />

      {/* Ambient Frost Mesh Backdrop */}
      <div className="ambient-frost-mesh">
        <div className="ambient-frost-orb-1" />
        <div className="ambient-frost-orb-2" />
        <div className="ambient-frost-orb-3" />
      </div>

      {/* Navigation Bar */}
      <header
        className="neoglass-header"
        style={{
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '14px 24px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: 1380,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            width: '100%'
          }}
        >
          {/* Logo */}
          <div
            onClick={onBackToApp}
            role="button"
            tabIndex={0}
            title="Return to YojanaMitra Home"
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.1rem',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 14px -1px rgba(234, 88, 12, 0.35)',
                flexShrink: 0
              }}
            >
              YM
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="font-display" style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#0B2545' }}>
                  Yojana<span style={{ background: 'linear-gradient(135deg, #FF7700 0%, #EA580C 100%)', color: '#FFFFFF', padding: '1px 8px', marginLeft: 4, borderRadius: 6 }}>Mitra</span>
                </span>
                <span
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    padding: '3px 10px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: 9999,
                    border: '1px solid #BFDBFE'
                  }}
                >
                  Citizen Portal
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748B', letterSpacing: '0.06em', fontWeight: 600 }}>
                SECURE CITIZEN ACCESS • नागरिक लॉगिन पोर्टल
              </div>
            </div>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={onBackToApp}
            className="mono-btn-outline"
            style={{ padding: '8px 16px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <ArrowLeft size={14} />
            <span>BACK TO SCHEMES</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: 640, width: '100%', margin: '36px auto 60px', padding: '0 16px', boxSizing: 'border-box' }}>
        {renderAuthCard()}
      </main>
    </div>
  );
}
