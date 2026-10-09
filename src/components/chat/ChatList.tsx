import React, { useState } from 'react';
import {
  FiSearch,
  FiSliders,
  FiArchive,
  FiInbox,
  FiMic,
  FiBellOff,
  FiCamera,
  FiMapPin,
  FiStar,
  FiMoreVertical,
  FiCheck,
  FiArrowLeft,
  FiX,
  FiSun,
  FiMoon,
  FiTrash2,
} from 'react-icons/fi';
import { BsCheckAll, BsPinAngle, BsPinFill } from 'react-icons/bs';
import { useChat, FilterType } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../common/Avatar';
import { Conversation } from '../../types';

interface ChatListProps {
  onSelectConversation?: (id: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectConversation }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    setIsInfoPanelOpen,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    toggleArchiveConversation,
    toggleFavoriteConversation,
    toggleMuteConversation,
    deleteConversation,
  } = useChat();

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenuConvId, setActiveMenuConvId] = useState<string | null>(null);

  const handleSelect = (id: string): void => {
    setActiveConversationId(id);
    setIsInfoPanelOpen(false);
    if (onSelectConversation) {
      onSelectConversation(id);
    }
  };

  const totalArchived = conversations.filter((c) => c.archived).length;
  const totalUnread = conversations.filter((c) => !c.archived).reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const filteredConversations = conversations.filter((conv) => {

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = conv.name.toLowerCase().includes(q);
      const matchText = conv.lastMessage?.text?.toLowerCase().includes(q);
      const matchRole = conv.role?.toLowerCase().includes(q);
      if (!matchName && !matchText && !matchRole) return false;
    }

    if (filter === 'archived') {
      return Boolean(conv.archived);
    }

    if (conv.archived) {
      return false;
    }

    if (filter === 'unread') return (conv.unreadCount || 0) > 0;
    if (filter === 'groups') return conv.isGroup;
    if (filter === 'favorites') return conv.favorite;
    return true;
  });

  const pinnedList = filteredConversations.filter((c) => c.pinned);
  const recentList = filteredConversations.filter((c) => !c.pinned);

  const renderConversationItem = (conv: Conversation) => {
    const isActive = conv.id === activeConversationId;
    const isMenuOpen = activeMenuConvId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => handleSelect(conv.id)}
        className={`group relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-2xl cursor-pointer transition-all select-none ${isActive
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-emerald-500/20'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
          }`}
      >

        <Avatar
          name={conv.name}
          avatarUrl={conv.avatar}
          initials={conv.initials}
          color={conv.color}
          size="md"
          online={conv.online}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4
              className={`text-sm truncate font-semibold ${isActive
                  ? 'text-emerald-950 dark:text-emerald-300'
                  : 'text-slate-900 dark:text-slate-100'
                }`}
            >
              {conv.name}
            </h4>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 shrink-0 ml-1">
              {conv.lastMessage?.timestamp || ''}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-1.5 truncate text-slate-500 dark:text-slate-400">
              {conv.lastMessage?.isTyping ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  </span>
                  <span>typing...</span>
                </div>
              ) : (
                <>
                  {conv.lastMessage?.isAudio && (
                    <FiMic className="text-emerald-600 dark:text-emerald-400 shrink-0 w-3.5 h-3.5" />
                  )}
                  {conv.lastMessage?.hasAttachment && (
                    <FiCamera className="text-slate-400 shrink-0 w-3.5 h-3.5" />
                  )}
                  {conv.lastMessage?.isLocation && (
                    <FiMapPin className="text-emerald-600 shrink-0 w-3.5 h-3.5" />
                  )}
                  <span className="truncate">{conv.lastMessage?.text || ''}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {conv.archived && (
                <span title="Archived">
                  <FiArchive className="text-emerald-600 dark:text-emerald-400 text-xs" />
                </span>
              )}

              {conv.muted && <FiBellOff className="text-slate-400 text-xs" />}

              {conv.favorite && (
                <FiStar className="text-amber-500 fill-amber-500 text-xs" />
              )}

              {conv.lastMessage?.isAudio && (
                <BsCheckAll className="text-emerald-600 dark:text-emerald-400 text-sm" />
              )}

              {conv.pinned && <BsPinAngle className="text-slate-400 text-xs" />}

              {(conv.unreadCount || 0) > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-emerald-700 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {conv.unreadCount}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuConvId(isMenuOpen ? null : conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-opacity cursor-pointer"
                title="Chat Options"
              >
                <FiMoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className="absolute right-3 top-10 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 text-xs animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                toggleArchiveConversation(conv.id);
                setActiveMenuConvId(null);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {conv.archived ? (
                <>
                  <FiInbox className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unarchive chat</span>
                </>
              ) : (
                <>
                  <FiArchive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Archive chat</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                toggleFavoriteConversation(conv.id);
                setActiveMenuConvId(null);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FiStar className="w-3.5 h-3.5 text-amber-500" />
              <span>{conv.favorite ? 'Remove Favorite' : 'Add to Favorites'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                toggleMuteConversation(conv.id);
                setActiveMenuConvId(null);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FiBellOff className="w-3.5 h-3.5 text-slate-400" />
              <span>{conv.muted ? 'Unmute' : 'Mute notifications'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                deleteConversation(conv.id);
                setActiveMenuConvId(null);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Delete chat</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full md:w-80 lg:w-84 h-full bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col md:shrink-0 relative">
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filter === 'archived' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to All Chats"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {filter === 'archived' ? 'Archived Chats' : 'Messages'}
          </h2>
          {filter === 'archived' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-mono">
              {totalArchived}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 relative">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? (
              <FiSun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <FiMoon className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilter(filter === 'archived' ? 'all' : 'archived')}
            className={`p-1.5 rounded-xl transition-all relative cursor-pointer ${filter === 'archived'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            title={filter === 'archived' ? 'Exit Archived Chats' : 'View Archived Chats'}
          >
            <FiArchive className="w-4 h-4" />
            {totalArchived > 0 && filter !== 'archived' && (
              <span className="absolute -top-0.5 -right-0.5 px-1 min-w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold font-mono flex items-center justify-center">
                {totalArchived}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowFilterMenu((prev) => !prev)}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${showFilterMenu ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            title="Filter options"
          >
            <FiSliders className="w-4 h-4" />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-9 z-40 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Filter Conversations
              </div>
              {[
                { id: 'all', label: 'All Conversations' },
                { id: 'unread', label: 'Unread Messages', count: totalUnread },
                { id: 'groups', label: 'Groups & Teams' },
                { id: 'favorites', label: 'Favorites / Vault' },
                { id: 'archived', label: 'Archived Chats', count: totalArchived },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFilter(item.id as FilterType);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${filter === item.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-700 text-white font-mono text-[9px]">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              filter === 'archived'
                ? 'Search archived chats...'
                : 'Search conversations, files...'
            }
            className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === 'all'
              ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === 'unread'
              ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <span>Unread</span>
          {totalUnread > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-mono">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('groups')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === 'groups'
              ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          Groups
        </button>

        <button
          type="button"
          onClick={() => setFilter('favorites')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === 'favorites'
              ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          Favorites
        </button>

        <button
          type="button"
          onClick={() => setFilter('archived')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === 'archived'
              ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <FiArchive className="w-3 h-3" />
          <span>Archived</span>
          {totalArchived > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-mono">
              {totalArchived}
            </span>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {pinnedList.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-4 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <BsPinAngle className="w-3 h-3" />
                <span>PINNED CHATS</span>
              </span>
              <span className="font-mono">{pinnedList.length}</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {pinnedList.map((conv) => renderConversationItem(conv))}
            </div>
          </div>
        )}

        {recentList.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-4 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              <span>{filter === 'archived' ? 'ARCHIVED CONVERSATIONS' : 'RECENT CHATS'}</span>
              {filter !== 'archived' && (
                <button
                  type="button"
                  className="text-[10px] text-emerald-700 dark:text-emerald-400 lowercase font-medium hover:underline cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
            <div className="space-y-0.5 mt-1">
              {recentList.map((conv) => renderConversationItem(conv))}
            </div>
          </div>
        )}

        {filteredConversations.length === 0 && (
          <div className="text-center py-12 px-4 text-slate-400">
            {filter === 'archived' ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <FiArchive className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No archived conversations
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  To archive a chat, click the options menu on any chat item or use the archive button in the header.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No conversations found
                </p>
                <p className="text-xs text-slate-400">Try refining your search keyword</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

