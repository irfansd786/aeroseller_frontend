import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  getGoogleRedirectResult,
  sendPasswordReset,
  toAppUser,
  saveCustomerProfile
} from '../firebase';

type AuthScreen = 'login' | 'signup' | 'forgot' | 'reset';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const [screen, setScreen] = useState<AuthScreen>('login');
  const [loading, setLoading] = useState(false);

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const user = await signInWithEmail(email, password);
      const token = await user.getIdToken();
      await saveCustomerProfile(user.uid, user.email || email, user.displayName || name, phone).catch((profileError) => {
        console.warn('Profile save failed during login, continuing auth:', profileError);
      });
      addToast('Logged in successfully!', 'success');
      login(token, 'customer', toAppUser(user, phone));
      navigate('/');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);

    try {
      const user = await signUpWithEmail(email, password, name);
      const token = await user.getIdToken();
      await saveCustomerProfile(user.uid, email, name, phone).catch((profileError) => {
        console.warn('Profile save failed during signup, continuing auth:', profileError);
      });
      addToast('Registered successfully! Welcome to AeroCart.', 'success');
      login(token, 'customer', toAppUser(user, phone));
      navigate('/');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await sendPasswordReset(email);
      addToast('Password reset email sent! Check your inbox.', 'info');
      setScreen('reset');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await signInWithGooglePopup();
      const token = await user.getIdToken();
      await saveCustomerProfile(user.uid, user.email || '', user.displayName || '', '').catch((profileError) => {
        console.warn('Google sign-in succeeded, but profile save failed:', profileError);
      });
      addToast('Google Sign-In completed!', 'success');
      login(token, 'customer', toAppUser(user));
      navigate('/');
      return;
    } catch (err: any) {
      console.error(err);
      const blockedError = err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/popup-blocked' || /popup blocked|pop-up blocked/i.test(err.message);
      if (blockedError) {
        addToast('Popup blocked. Redirecting to Google sign-in instead.', 'info');
        try {
          await signInWithGoogleRedirect();
          return;
        } catch (redirectError: any) {
          console.error('Google redirect fallback failed:', redirectError);
          addToast(redirectError.message || 'Google redirect sign-in failed', 'error');
        }
      } else {
        addToast(err.message || 'Google Sign-In failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkGoogleRedirect = async () => {
      setLoading(true);
      try {
        const user = await getGoogleRedirectResult();
        if (user) {
          const token = await user.getIdToken();
          await saveCustomerProfile(user.uid, user.email || '', user.displayName || '', '').catch((profileError) => {
            console.warn('Google redirect profile save failed:', profileError);
          });
          addToast('Google Sign-In completed!', 'success');
          login(token, 'customer', toAppUser(user));
          navigate('/');
        }
      } catch (err: any) {
        console.error('Google redirect result error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkGoogleRedirect();
  }, [addToast, login, navigate]);

  return (
    <div className="max-w-full mx-auto px-4 py-16 flex flex-col justify-center min-h-[500px]">
      <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-8 shadow-xl space-y-6">
        
        {/* Header titles */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base">A</span>
            <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">AeroCart</span>
          </Link>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            {screen === 'login' && "Welcome Back"}
            {screen === 'signup' && "Create Account"}
            {screen === 'forgot' && "Reset Password"}
            {screen === 'reset' && "Reset Link Sent"}
          </h2>
          <p className="text-[11px] text-neutral-450 mt-1">
            {screen === 'login' && "Sign in to access your carts and bookmarks."}
            {screen === 'signup' && "Fill out your credentials to browse premium items."}
            {screen === 'forgot' && 'We will send a password reset link to your email.'}
            {screen === 'reset' && `A reset email has been sent to ${email}. Check your inbox and return to sign in.`}
          </p>
        </div>

        {/* 1. LOGIN FORM */}
        {screen === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-450 uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-150 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-neutral-450 uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => setScreen('forgot')}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-150 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              {loading ? "Logging in..." : "Login"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. SIGNUP FORM */}
        {screen === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-450 uppercase">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-150 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-450 uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-150 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-450 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="+1 555 0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-150 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-450 uppercase">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-150 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              {loading ? "Creating..." : "Sign Up"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {screen === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-450 uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-150 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              {loading ? "Sending..." : "Request Reset Code"} <KeyRound className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 4. PASSWORD RESET CONFIRMATION */}
        {screen === 'reset' && (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              A password reset link has been sent to <strong>{email}</strong>. Open it and follow the instructions to update your password.
            </p>
            <button
              type="button"
              onClick={() => setScreen('login')}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Divider / Google Login / Switch screen links */}
        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-zinc-850 text-center">
          
          {/* Continue with Google button */}
          {(screen === 'login' || screen === 'signup') && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-neutral-200 dark:border-zinc-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              {/* Google Colored Icon mock */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.67 5.67 0 0 1 8.3 12.93a5.67 5.67 0 0 1 5.69-5.675c1.47 0 2.8.55 3.82 1.455l3.23-3.23A10.145 10.145 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.78 0 9.87-4.06 9.87-10 0-.685-.06-1.35-.19-1.715h-11.43z" />
              </svg>
              Continue with Google
            </button>
          )}

          <div className="text-xs font-semibold">
            {screen === 'login' && (
              <p className="text-neutral-500">
                New shopper?{" "}
                <button onClick={() => setScreen('signup')} className="text-primary hover:underline">
                  Create an account
                </button>
              </p>
            )}
            {screen === 'signup' && (
              <p className="text-neutral-500">
                Already registered?{" "}
                <button onClick={() => setScreen('login')} className="text-primary hover:underline">
                  Sign In
                </button>
              </p>
            )}
            {(screen === 'forgot' || screen === 'reset') && (
              <p className="text-neutral-500">
                Back to{" "}
                <button onClick={() => setScreen('login')} className="text-primary hover:underline">
                  Sign In
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
