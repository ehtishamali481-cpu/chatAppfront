import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMessageSquare, FiPhone } from 'react-icons/fi';
import { RiSparkling2Fill, RiRecordCircleLine } from 'react-icons/ri';
import { useChat } from '../../context/ChatContext';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations } = useChat();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const tabs = [
    {
      id: 'chats',
      label: 'Chats',
      path: '/chat',
      icon: FiMessageSquare,
      badge: totalUnread > 0 ? totalUnread : undefined,
    },
    {
      id: 'copilot',
      label: 'AI Copilot',
      path: '/copilot',
      icon: RiSparkling2Fill,
    },
    {
      id: 'status',
      label: 'Status',
      path: '/status',
      icon: RiRecordCircleLine,
    },
    {
      id: 'calls',
      label: 'Calls',
      path: '/calls',
      icon: FiPhone,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 grid grid-cols-4 items-center h-16 pb-safe select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          location.pathname === tab.path ||
          (tab.id === 'chats' && location.pathname === '/');

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors relative"
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 scale-110'
                    : 'text-slate-400 dark:text-slate-400'
                }`}
              />

              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-emerald-700 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {tab.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[11px] font-medium tracking-tight mt-1 ${
                isActive
                  ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
