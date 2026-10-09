import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPhone,
  FiVideo,
  FiSearch,
  FiLock,
  FiArrowLeft,
  FiBell,
  FiWifiOff,
  FiRefreshCw,
  FiArchive,
  FiInbox,
  FiInfo,
  FiTrash2,
} from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { useChat, TopTab } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { SettingsModal } from '../common/SettingsModal';

interface ChatCanvasProps {
  onBackMobile?: () => void;
}

export const ChatCanvas: React.FC<ChatCanvasProps> = ({ onBackMobile }) => {
  const navigate = useNavigate();
  const {
    activeConversation,
    messages,
    toggleInfoPanel,
    startCall,
    activeTopTab,
    setActiveTopTab,
    setFilter,
    toggleArchiveConversation,
    deleteConversation,
    toggleNotifications,
    unreadNotificationCount,
    isOnline,
    syncStatus,
    pendingCount,
    manualSync,
    isAiThinking,
    sendMessage,
  } = useChat();

  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTopTabClick = (tab: TopTab) => {
    setActiveTopTab(tab);
    if (tab === 'all') {
      setFilter('all');
    } else if (tab === 'channels') {
      setFilter('groups');
    } else if (tab === 'copilot') {
      navigate('/copilot');
    } else if (tab === 'audio-video') {
      navigate('/calls');
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-2xl mb-4">
          💬
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Select a conversation
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Pick an encrypted channel or team member from the left to start collaborating.
        </p>
      </div>
    );
  }

  const conv = activeConversation;

  const displayMessages = inChatSearchQuery.trim()
    ? messages.filter((m) =>
      m.content.toLowerCase().includes(inChatSearchQuery.toLowerCase()) ||
      m.attachment?.name?.toLowerCase().includes(inChatSearchQuery.toLowerCase())
    )
    : messages;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-slate-950 relative min-w-0 overflow-hidden">

      <div className="hidden md:flex items-center justify-between px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shrink-0">

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleTopTabClick('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${activeTopTab === 'all'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            All Chats
          </button>
          <button
            type="button"
            onClick={() => handleTopTabClick('channels')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${activeTopTab === 'channels'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            Channels
          </button>
          <button
            type="button"
            onClick={() => handleTopTabClick('copilot')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${activeTopTab === 'copilot'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            Copilot
          </button>
          <button
            type="button"
            onClick={() => handleTopTabClick('audio-video')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${activeTopTab === 'audio-video'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            Audio & Video
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowInChatSearch((prev) => !prev)}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${showInChatSearch
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            title="Search Messages"
          >
            <FiSearch className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleNotifications}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 relative p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <FiBell className="w-4 h-4" />
            {unreadNotificationCount > 0 ? (
              <span className="px-1 min-w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold font-mono absolute -top-0.5 -right-0.5 flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Avatar name={user?.name || 'Sarah Jenkins'} avatarUrl={user?.avatarUrl} size="sm" online={true} />
            <div className="text-left text-xs leading-tight hidden lg:block">
              <p className="font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Sarah Jenkins'}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
            </div>
          </button>
        </div>
      </div>
      {showInChatSearch && (
        <div className="px-6 py-2 bg-emerald-50/60 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-3 animate-in slide-in-from-top-2">
          <FiSearch className="w-4 h-4 text-emerald-600" />
          <input
            type="text"
            value={inChatSearchQuery}
            onChange={(e) => setInChatSearchQuery(e.target.value)}
            placeholder={`Search in conversation with ${conv.name}...`}
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {inChatSearchQuery && (
            <span className="text-[11px] font-mono text-slate-500">
              {displayMessages.length} found
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setInChatSearchQuery('');
              setShowInChatSearch(false);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
      <div className="fixed top-0 left-0 right-0 md:relative z-40 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shrink-0 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackMobile && (
            <button
              type="button"
              onClick={onBackMobile}
              className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div
            onClick={toggleInfoPanel}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleInfoPanel();
              }
            }}
            className="flex items-center gap-3 min-w-0 cursor-pointer group hover:opacity-90 transition-all select-none text-left"
            title={`Click name or profile picture to view ${conv.name}'s details`}
          >
            <div className="relative shrink-0 group-hover:scale-105 transition-transform">
              <Avatar
                name={conv.name}
                avatarUrl={conv.avatar}
                initials={conv.initials}
                color={conv.color}
                size="md"
                online={conv.online}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                  {conv.name}
                </h3>
                {conv.role && (
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
                    {conv.role}
                  </span>
                )}
                {conv.archived && (
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <FiArchive className="w-3 h-3" />
                    <span>Archived</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {conv.online ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                  </>
                ) : (
                  <span>{conv.lastSeen ? `Last seen ${conv.lastSeen}` : 'Offline'}</span>
                )}
                <span>•</span>
                <span className="truncate group-hover:underline">View details</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => startCall(conv, 'audio')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Audio call"
          >
            <FiPhone className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={() => startCall(conv, 'video')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Video call"
          >
            <FiVideo className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={() => toggleArchiveConversation(conv.id)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${conv.archived
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            title={conv.archived ? 'Unarchive this chat' : 'Archive this chat'}
          >
            {conv.archived ? (
              <FiInbox className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <FiArchive className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowInChatSearch((prev) => !prev)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors hidden sm:block cursor-pointer"
            title="Search conversation"
          >
            <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={() => deleteConversation(conv.id)}
            className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete this chat"
          >
            <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={toggleInfoPanel}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Contact information"
          >
            <FiInfo className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
      {(!isOnline || syncStatus === 'offline' || pendingCount > 0) && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <FiWifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {!isOnline
                ? `Offline Mode — Messages cached in local storage (${pendingCount} pending sync)`
                : syncStatus === 'syncing'
                  ? `Synchronizing ${pendingCount} offline message(s) with server...`
                  : `${pendingCount} message(s) ready to sync`}
            </span>
          </div>
          {isOnline && pendingCount > 0 && (
            <button
              type="button"
              onClick={manualSync}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-950 dark:text-amber-100 font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
            >
              <FiRefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pt-[68px] md:pt-4">
        <div className="max-w-md mx-auto my-2 p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400 shadow-2xs">
          <FiLock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Messages and calls are end-to-end encrypted. No one outside this chat can read them.</span>
        </div>
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl mb-2">
              💬
            </div>
            <p className="text-xs font-medium">No messages yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Send a message below to start chatting!</p>
          </div>
        )}
        {displayMessages.map((message, index) => {
          const getDateKey = (dateInput?: number | string | Date) => {
            if (!dateInput) return 'today';
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return 'today';
            return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          };

          const getChatDateLabel = (dateInput?: number | string | Date): string => {
            if (!dateInput) return 'Today';
            const msgDate = new Date(dateInput);
            if (isNaN(msgDate.getTime())) return 'Today';

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const target = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

            const diffMs = today.getTime() - target.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              return 'Today';
            } else if (diffDays === 1) {
              return 'Yesterday';
            } else {
              return msgDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }
          };

          const currentKey = getDateKey(message.createdAt);
          const prevKey = index > 0 ? getDateKey(displayMessages[index - 1].createdAt) : null;
          const showDateDivider = currentKey !== prevKey;
          const dateLabel = getChatDateLabel(message.createdAt);

          return (
            <React.Fragment key={message.id}>
              {showDateDivider && (
                <div className="flex justify-center my-3 sticky top-1 z-10 pointer-events-none">
                  <span className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 shadow-xs border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-xs select-none">
                    {dateLabel}
                  </span>
                </div>
              )}
              <ChatMessage message={message} />
            </React.Fragment>
          );
        })}
        {conv.id === 'chatly_ai' && isAiThinking && (
          <div className="flex items-center gap-3 p-3 max-w-xs rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm animate-in fade-in">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <RiSparkling2Fill className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Chatly AI is thinking</span>
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        {conv.id === 'chatly_ai' && displayMessages.length === 0 && !isAiThinking && (
          <div className="pt-2 pb-1 animate-in fade-in">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
              ✨ Suggested prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'How are you doing today?',
                'Help me draft a professional message',
                'Explain how calling works in this app',
                'Summarize recent conversations',
              ].map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => sendMessage(promptText, 'text')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all shadow-2xs active:scale-95 text-left cursor-pointer"
                >
                  💬 {promptText}
                </button>
              ))}
            </div>
          </div>
        )}
        {conv.lastMessage?.isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-2">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
            </span>
            <span>{conv.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
