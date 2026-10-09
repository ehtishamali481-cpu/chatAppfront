import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import { PulseLogo } from '../components/common/PulseLogo';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const isEmailValid = email.includes('@') && email.includes('.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.');
      return;
    }

    const success = await login(email, password, rememberMe);
    if (success) {
      navigate('/chat');
    }
  };

  const handleResetSim = () => {
    setEmail('test@gmail.com');
    setPassword('Pass@123');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <header className="max-w-md w-full mx-auto flex items-center justify-between pb-4 select-none">
        <div className="flex items-center gap-2.5">
          <PulseLogo size={34} />
          <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
            Chatly
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shadow-2xs">
          <FiShield className="text-emerald-600 dark:text-emerald-400 w-3.5 h-3.5" />
          <span className="font-medium text-[11px]">End-to-End Encrypted</span>
        </div>
      </header>
      <main className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 my-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to continue to Chatly Messenger
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-slate-200 block mb-1.5">
              Email address
            </label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {isEmailValid && (
                <FiCheckCircle className="absolute right-3.5 text-emerald-500 w-4 h-4" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                Password
              </label>
              <Link
                to="/reset-password"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Remember this device
              </span>
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 active:scale-98 transition-all disabled:opacity-70 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Demo credentials:
          </span>
          <button
            type="button"
            onClick={handleResetSim}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            Auto Fill
          </button>
        </div>
        <div className="text-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
          </span>
          <Link
            to="/signup"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Sign up for Chatly
          </Link>
        </div>
      </main>
      <footer className="max-w-md w-full mx-auto flex items-center justify-center pt-6 text-[11px] text-slate-400 dark:text-slate-500 select-none">
        <p>© 2026 Chatly Messenger Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
