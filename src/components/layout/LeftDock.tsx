import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiMessageSquare,
  FiPhone,
  FiUsers,
  FiSettings,
  FiPlus,
  FiLogOut,
  FiFolder,
  FiCamera,
  FiTrash2,
  FiArchive,
} from 'react-icons/fi';
import { RiSparkling2Fill, RiRecordCircleLine } from 'react-icons/ri';
import { PulseLogo } from '../common/PulseLogo';
import { Avatar } from '../common/Avatar';
import { ComposeModal } from '../common/ComposeModal';
import { SettingsModal } from '../common/SettingsModal';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export const LeftDock: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();
  const {
    filter,
    setFilter,
    setIsInfoPanelOpen,
  } = useChat();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const dockFileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const currentUser = user as any;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleDockAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        await updateUser({ avatarUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const [settingsDefaultTab, setSettingsDefaultTab] = useState<
    'profile' | 'security' | 'notifications' | 'appearance'
  >('profile');

  const handleNavClick = (id: string, path: string) => {
    setIsInfoPanelOpen(false);
    if (id === 'chats') {
      setFilter('all');
      navigate('/chat');
    } else if (id === 'groups') {
      setFilter('groups');
      navigate('/chat');
    } else if (id === 'vault') {
      setFilter('favorites');
      navigate('/chat');
    } else if (id === 'archived') {
      setFilter('archived');
      navigate('/chat');
    } else {
      navigate(path);
    }
  };

  const isNavActive = (id: string, path: string): boolean => {
    if (id === 'chats') return location.pathname === '/chat' && filter === 'all';
    if (id === 'groups') return location.pathname === '/chat' && filter === 'groups';
    if (id === 'vault') return location.pathname === '/chat' && filter === 'favorites';
    if (id === 'archived') return location.pathname === '/chat' && filter === 'archived';
    return location.pathname === path;
  };

  const navItems = [
    { id: 'chats', path: '/chat', icon: FiMessageSquare, title: 'All Chats' },
    { id: 'copilot', path: '/copilot', icon: RiSparkling2Fill, title: 'Chatly AI Assistant' },
    { id: 'status', path: '/status', icon: RiRecordCircleLine, title: 'Stories & Status' },
    { id: 'groups', path: '/chat', icon: FiUsers, title: 'Groups & Teams' },
    { id: 'calls', path: '/calls', icon: FiPhone, title: 'Audio & Video Calls' },
    { id: 'vault', path: '/chat', icon: FiFolder, title: 'Encrypted Vault' },
  ];

  return (
    <>
      <aside className="w-16 h-full bg-slate-50 dark:bg-slate-950 border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col items-center justify-between py-4 select-none shrink-0 z-20">

        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="hover:scale-105 transition-transform cursor-pointer"
            title="Chatly Messenger"
          >
            <PulseLogo size={38} />
          </button>
          <nav className="flex flex-col items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.id, item.path);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id, item.path)}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${active
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  title={item.title}
                >
                  <Icon className="w-5 h-5" />
                  {active && (
                    <span className="absolute -left-3 top-2.5 bottom-2.5 w-1 rounded-r-full bg-emerald-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setShowComposeModal(true)}
            className="w-10 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 active:scale-95 transition-all mb-1 cursor-pointer"
            title="Compose Message & Add User"
          >
            <FiPlus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSettingsDefaultTab('profile');
              setShowSettingsModal(true);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Settings"
          >
            <FiSettings className="w-4.5 h-4.5" />
          </button>
          <div className="relative pt-1" ref={profileMenuRef}>
            <Avatar
              name={currentUser?.name || currentUser?.fullName || 'User'}
              avatarUrl={currentUser?.avatarUrl}
              size="sm"
              online={true}
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="cursor-pointer"
            />

            {showProfileMenu && (
              <div className="absolute bottom-2 left-14 z-50 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 animate-in fade-in zoom-in-95">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {currentUser?.name || currentUser?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
                  {currentUser?.about && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 truncate">
                      "{currentUser.about}"
                    </p>
                  )}

                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {currentUser?.title || 'Online Member'}
                  </span>
                </div>

                <div className="pt-2 space-y-1">
                  <input
                    type="file"
                    ref={dockFileInputRef}
                    accept="image/*"
                    onChange={handleDockAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      dockFileInputRef.current?.click();
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiCamera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Change DP (Upload)</span>
                  </button>

                  {currentUser?.avatarUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await updateUser({ avatarUrl: '' });
                      }}
                      className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      <span>Remove DP</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setSettingsDefaultTab('profile');
                      setShowSettingsModal(true);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiSettings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Profile & Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setFilter('archived');
                      navigate('/chat');
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiArchive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Archived Chats</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
      <ComposeModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
      />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        defaultTab={settingsDefaultTab}
      />
    </>
  );
};