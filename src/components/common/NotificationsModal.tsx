import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiX,
  FiCheck,
  FiTrash2,
  FiMessageSquare,
  FiPhone,
  FiAtSign,
  FiFileText,
  FiInfo,
} from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { AppNotification } from '../../types';

export const NotificationsModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadNotificationCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setActiveConversationId,
    setIsInfoPanelOpen,
  } = useChat();

  if (!isNotificationsOpen) return null;

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    if (notif.conversationId) {
      setActiveConversationId(notif.conversationId);
      setIsInfoPanelOpen(false);
      navigate('/chat');
    }
    setIsNotificationsOpen(false);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'call':
        return <FiPhone className="w-4 h-4 text-amber-500" />;
      case 'mention':
        return <FiAtSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'file':
        return <FiFileText className="w-4 h-4 text-blue-500" />;
      case 'system':
        return <FiInfo className="w-4 h-4 text-purple-500" />;
      default:
        return <FiMessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-end sm:justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
      onClick={() => setIsNotificationsOpen(false)}
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border-l sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-right sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <FiBell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                {unreadNotificationCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-700 text-white">
                    {unreadNotificationCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Activity, mentions & calls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close notifications"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FiCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
            <button
              type="button"
              onClick={clearNotifications}
              className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <FiBell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                All caught up!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                You have no unread alerts or notifications.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl flex items-start gap-3 cursor-pointer transition-all ${!notif.read
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-xs truncate ${!notif.read
                          ? 'font-bold text-slate-900 dark:text-slate-100'
                          : 'font-semibold text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
