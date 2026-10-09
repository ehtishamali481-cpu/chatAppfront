import React, { useEffect, useState, useRef } from 'react';
import {
  FiX,
  FiShield,
  FiLock,
  FiBell,
  FiMoon,
  FiSun,
  FiCheckCircle,
  FiKey,
  FiUser,
  FiCheck,
  FiCamera,
  FiTrash2,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from './Avatar';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

const ABOUT_PRESETS = [
  'Hey there! I am using WhatsApp.',
  'Available',
  'Busy',
  'At work',
  'In a meeting',
  'At school',
  'At the movies',
  'Battery about to die',
  "Can't talk, WhatsApp only",
  'Sleeping',
  'Urgent calls only',
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'security' | 'notifications' | 'appearance';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'profile',
}) => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { userPrefs, updateUserPrefs } = useChat();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>(
    defaultTab
  );

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [aboutText, setAboutText] = useState(user?.about || 'Hey there! I am using WhatsApp.');
  const [isSaving, setIsSaving] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setAboutText(user.about || 'Hey there! I am using WhatsApp.');
    }
  }, [user]);

  const formatAboutDate = (dateString?: string) => {
    if (!dateString) return 'Not updated yet';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0) return `Today at ${timeStr}`;
    if (diffDays === 1) return `Yesterday at ${timeStr}`;
    return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`;
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        name: displayName.trim() || user?.name,
        about: aboutText.trim() || 'Hey there! I am using WhatsApp.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateUser({ avatarUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateUser({ avatarUrl: '' });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Workspace Preferences
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Security, Notifications & Account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex gap-1 sm:gap-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: FiUser },
            { id: 'security', label: 'Security & Keys', icon: FiKey },
            { id: 'notifications', label: 'Notifications', icon: FiBell },
            { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? FiMoon : FiSun },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${isTabActive
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="relative group shrink-0">
                  <Avatar
                    name={user?.name || 'Sarah Jenkins'}
                    avatarUrl={user?.avatarUrl}
                    size="xl"
                    online={true}
                    className="shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change profile picture"
                  >
                    <FiCamera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {user?.name || 'Sarah Jenkins'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FiCamera className="w-3.5 h-3.5" />
                      <span>{user?.avatarUrl ? 'Change DP' : 'Upload DP'}</span>
                    </button>
                    {user?.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        <span>Remove DP</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Or select a preset profile picture:
                </p>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {AVATAR_PRESETS.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateUser({ avatarUrl: presetUrl })}
                      className={`relative rounded-full p-0.5 border-2 transition-all hover:scale-110 cursor-pointer ${user?.avatarUrl === presetUrl
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                        : 'border-transparent hover:border-emerald-400'
                        }`}
                      title={`Preset Avatar #${idx + 1}`}
                    >
                      <img
                        src={presetUrl}
                        alt="Avatar preset"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>
                  ))}
                  {user?.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-2.5 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[11px] font-bold hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0"
                      title="Clear photo to show default monogram"
                    >
                      Use Monogram
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      About / Status
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {aboutText.length}/250
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={250}
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    placeholder="Set your status or bio..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                  />
                  <div className="mt-2">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Select or tap to use a status preset:
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ABOUT_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAboutText(preset)}
                          className={`px-2.5 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${aboutText === preset
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-400 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium">Last updated:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formatAboutDate(user?.aboutUpdatedAt)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Enterprise Workspace Email
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || 'sarah.j@chatly.internal'}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <FiCheck className="w-3.5 h-3.5" />
                        <span>Save Profile & About</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-1">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>256-bit AES End-to-End Encryption Verified</span>
                </div>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400">
                  Communications and attachments are protected by Double Ratchet cryptographic keys.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between py-1">
                  <span>TLS Transport Security</span>
                  <span className="font-mono font-semibold text-emerald-600">TLS 1.3 Active</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Zero-Knowledge Multi-device Sync</span>
                  <span className="font-mono font-semibold text-emerald-600">Enabled</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Desktop Notifications
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Show notification banners for direct messages
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={userPrefs.desktopNotify}
                  onChange={(e) => updateUserPrefs({ desktopNotify: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Sound Alerts
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Play discreet sound on incoming communications
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={userPrefs.soundEnabled}
                  onChange={(e) => updateUserPrefs({ soundEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Read Receipts
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Send double-check acknowledgement markers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={userPrefs.readReceipts}
                  onChange={(e) => updateUserPrefs({ readReceipts: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your preferred interface theme. Selected theme is cached across sessions.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <FiSun className="w-6 h-6 text-amber-500" />
                  <span className="text-xs">Light Theme</span>
                  {theme === 'light' && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Active</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <FiMoon className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs">Dark Theme</span>
                  {theme === 'dark' && (
                    <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
