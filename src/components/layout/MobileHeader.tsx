import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCamera,
  FiSearch,
  FiMoreVertical,
  FiSun,
  FiMoon,
  FiLogOut,
  FiBell,
  FiArchive,
  FiSettings,
} from 'react-icons/fi';
import { PulseLogo } from '../common/PulseLogo';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { SettingsModal } from '../common/SettingsModal';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'Chatly',
  subtitle = 'Chats',
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    setFilter,
    toggleNotifications,
    unreadNotificationCount,
    setIsInfoPanelOpen,
  } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-30 select-none">

        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => {
            setFilter('all');
            setIsInfoPanelOpen(false);
            navigate('/chat');
          }}
        >
          <PulseLogo size={32} />
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {title}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => navigate('/status')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Stories & Camera"
          >
            <FiCamera className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Options"
            >
              <FiMoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-50 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setFilter('archived');
                    navigate('/chat');
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <FiArchive className="w-4 h-4 text-emerald-600" />
                  <span>Archived Chats</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowSettings(true);
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <FiSettings className="w-4 h-4 text-slate-500" />
                  <span>Settings & Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    toggleTheme();
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {theme === 'dark' ? <FiSun className="text-amber-400 w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
          <Avatar
            name={user?.name || 'Sarah Jenkins'}
            avatarUrl={user?.avatarUrl}
            size="sm"
            online={true}
            onClick={() => setShowMenu((prev) => !prev)}
            className="cursor-pointer ml-1"
          />
        </div>
      </header>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};
