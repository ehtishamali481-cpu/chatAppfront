import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheckCircle,
  FiCamera,
  FiTrash2,
  FiShield,
} from 'react-icons/fi';
import { PulseLogo } from '../components/common/PulseLogo';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const passedCount = [hasMinLength, hasNumber, hasUppercase, hasSymbol].filter(Boolean).length;
  const strengthScore = passedCount * 25;

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isEmailValid = email.includes('@') && email.includes('.');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Full Name is required.');
      return;
    }

    if (!isEmailValid) {
      toast.error('A valid Email is required.');
      return;
    }

    if (!hasMinLength || !hasNumber || !hasUppercase) {
      toast.error('Password must be at least 8 chars with 1 number and 1 uppercase letter.');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please accept the Terms to continue.');
      return;
    }

    try {
      const success = await signup({
        fullName,
        email,
        password,
        profileImage: avatarPreview || undefined,
      });

      if (success) {
        navigate('/chat');
      }
    } catch (error) {
      toast.error('Sign Up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
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

      {/* Main Centered Auth Card */}
      <main className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 my-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join Chatly for encrypted messaging & calling
          </p>
        </div>

        {/* Profile Picture Uploader (Optional) */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center text-white text-lg font-bold border-2 border-white dark:border-slate-800 shadow-xs">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{fullName.charAt(0) || 'U'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              title="Upload Photo"
            >
              <FiCamera className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Profile Photo
              </h4>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <FiTrash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              PNG, JPG or WebP up to 5MB (Optional)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-slate-200 block mb-1.5">
              Full Name *
            </label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {fullName.trim().length > 2 && (
                <FiCheckCircle className="absolute right-3.5 text-emerald-500 w-4 h-4" />
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-slate-200 block mb-1.5">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {isEmailValid && (
                <FiCheckCircle className="absolute right-3.5 text-emerald-500 w-4 h-4" />
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                Password *
              </label>
              {password.length > 0 && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Strength: {strengthScore}%
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                Confirm Password *
              </label>
              {passwordsMatch && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Passwords match
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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

          {/* Terms Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                I agree to the Terms of Service & Privacy Policy
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 active:scale-98 transition-all disabled:opacity-70 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Already have account */}
        <div className="text-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
          </span>
          <Link
            to="/login"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Sign in to Chatly
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto flex items-center justify-center pt-6 text-[11px] text-slate-400 dark:text-slate-500 select-none">
        <p>© 2026 Chatly Messenger Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
