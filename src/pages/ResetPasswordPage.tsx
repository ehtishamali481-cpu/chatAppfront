import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiSend,
  FiShield,
  FiGlobe,
  FiX,
  FiArrowRight,
  FiSmartphone,
  FiMonitor,
  FiHelpCircle,
  FiKey,
} from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { PulseLogo } from '../components/common/PulseLogo';
import { toast } from 'react-toastify';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [showBanner, setShowBanner] = useState(true);
  const [email, setEmail] = useState('alex.vance@chatly.internal');
  const [code, setCode] = useState(['4', '8', '2', '', '', '']);
  const [countdown, setCountdown] = useState(42);
  const [newPassword, setNewPassword] = useState('ChatlySecure#2026');
  const [confirmPassword, setConfirmPassword] = useState('ChatlySecure#2026');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    setCountdown(60);
    setShowBanner(true);
  };

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid work email address.');
      return;
    }
    setShowBanner(true);
    setCountdown(60);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (code.some((digit) => !digit)) {
      toast.error('Please enter the complete 6-digit confirmation code.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters with numbers and symbols.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Password updated successfully! Re-encrypting active sessions.');
      navigate('/login');
    }, 800);
  };

  const isEmailValid = email.includes('@') && email.includes('.');
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">

      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-4 select-none">
        <div className="flex items-center gap-2.5">
          <PulseLogo size={36} />
          <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
            Chatly Messenger
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <FiShield className="text-emerald-600 dark:text-emerald-400 w-3.5 h-3.5" />
            <span className="font-medium">End-to-End Encrypted</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <FiGlobe className="text-slate-400 w-3.5 h-3.5" />
            <span>English (US)</span>
          </div>
        </div>
      </header>

      {showBanner && (
        <div className="max-w-5xl w-full mx-auto mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-3.5 rounded-2xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-sm shadow-xs">
                <FiMail />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-50">
                  Password reset instructions sent
                </h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  A 6-digit confirmation code was dispatched to your inbox. Check your spam if not received in 60s.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-lg text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition-colors"
              title="Dismiss banner"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <main className="max-w-5xl w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden my-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center">

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-lg">
                <FiKey />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  ACCOUNT PROTECTION • 256-BIT TLS
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  Reset your password
                </h2>
              </div>
            </div>
            <PulseLogo size={28} />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            Enter your registered work email to receive a secure 6-digit recovery code and reset link.
            Once validated, set your new operational credentials.
          </p>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                  Email Address *
                </label>
                {isEmailValid && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    <span>Verified corporate domain</span>
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@chatly.internal"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {isEmailValid && (
                  <FiCheckCircle className="absolute right-3.5 text-emerald-500 w-4 h-4" />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendLink}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>Send Recovery Link & Code</span>
            </button>
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute flex items-center gap-1">
                <span>🔐 STEP 2 - ENTER 6-DIGIT CODE</span>
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                  Verification Code
                </label>
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleResendCode}
                  className={`text-[11px] font-mono font-medium ${countdown > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-emerald-700 hover:underline cursor-pointer'
                    }`}
                >
                  {countdown > 0 ? `Resend code in 0:${countdown < 10 ? '0' : ''}${countdown}` : 'Resend code now'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mb-2">
                We transmitted a 6-digit verification code. Enter the numeric pattern below.
              </p>
              <div className="grid grid-cols-6 gap-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-full h-12 text-center text-lg font-bold font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                  New Password *
                </label>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Password Strength: Strong (88%)
                </span>
              </div>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-600 w-[88%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                  Confirm New Password *
                </label>
                {passwordsMatch && (
                  <span className="text-[11px] text-emerald-600 font-medium">✓ Passwords match</span>
                )}
              </div>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-2.5 text-xs">
              <span className="text-base mt-0.5">📟</span>
              <div>
                <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                  Hardware / TOTP Note:
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  If you have 2FA enabled, your recovery key or authenticator confirmation will be requested next upon login.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 active:scale-98 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Re-encrypting Keyring...</span>
                </>
              ) : (
                <>
                  <span>Update Password & Re-encrypt Keyring</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              ← Return to Sign In
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-slate-100 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                SECURITY EVALUATION
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                🛡️ Grade A+
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex items-center gap-4">

              <div className="relative w-16 h-16 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold font-mono text-emerald-800 dark:text-emerald-300">
                  92%
                </span>
                <span className="text-[8px] uppercase tracking-tighter text-slate-400">Defense</span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Hardware-level E2EE Active
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                  Password rotation terminates all unauthorized active sessions across mobile and desktop clients.
                </p>
              </div>
            </div>
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-500" />
                  <span>Minimum 12 characters</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-600">Met</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-500" />
                  <span>Mixed case & numerical</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-600">Met</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-500" />
                  <span>Distinct symbol syntax</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-600">Met</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                <FiMonitor className="text-emerald-600" />
                <span>Linked Workstations</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                Resetting will enforce key regeneration for these active terminals:
              </p>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiMonitor className="text-slate-400 w-4 h-4" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        MacBook Pro 16"
                      </p>
                      <p className="text-[10px] text-slate-400">San Francisco, US - Active now</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Current
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiSmartphone className="text-slate-400 w-4 h-4" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        iPhone 15 Pro
                      </p>
                      <p className="text-[10px] text-slate-400">Chatly Mobile v4.8.2 - Idle</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800">
                    Will Disconnect
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                NEED HELP?
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Lost 2FA phone or recovery key?
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Contact your enterprise security administrator or IT desk.
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0 transition-colors"
            >
              Contact IT
            </button>
          </div>
        </div>
      </main>
      <footer className="max-w-5xl w-full mx-auto flex items-center justify-center pt-6 text-[11px] text-slate-400 dark:text-slate-500 select-none">
        <p>© 2026 Chatly Messenger Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
