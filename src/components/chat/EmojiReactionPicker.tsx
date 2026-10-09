import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiCheck, FiZap, FiSmile } from 'react-icons/fi';

interface EmojiReactionPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface EmojiItem {
  emoji: string;
  name: string;
  category: 'acks' | 'celebration' | 'work' | 'faces';
  shortcut?: string;
}

const EMOJI_DATABASE: EmojiItem[] = [

  { emoji: '👍', name: 'Thumbs Up / Acknowledge', category: 'acks', shortcut: 'Ack' },
  { emoji: '👀', name: 'Looking / Reviewing', category: 'acks', shortcut: 'Reviewing' },
  { emoji: '✅', name: 'Approved / Completed', category: 'acks', shortcut: 'Approved' },
  { emoji: '🚀', name: 'Shipped / Deployed', category: 'acks', shortcut: 'Shipped' },
  { emoji: '🙌', name: 'Hands Raised / Kudos', category: 'acks', shortcut: 'Kudos' },
  { emoji: '🫡', name: 'Salute / On It', category: 'acks', shortcut: 'On it' },
  { emoji: '🤝', name: 'Agreement / Deal', category: 'acks', shortcut: 'Agreed' },
  { emoji: '🎯', name: 'Bullseye / Perfect', category: 'acks', shortcut: 'Spot on' },
  { emoji: '💯', name: '100% Verified', category: 'acks', shortcut: '100%' },

  { emoji: '🔥', name: 'Fire / Great Work', category: 'celebration' },
  { emoji: '❤️', name: 'Heart / Love It', category: 'celebration' },
  { emoji: '👏', name: 'Applause / Well Done', category: 'celebration' },
  { emoji: '🎉', name: 'Party Popper / Milestone', category: 'celebration' },
  { emoji: '✨', name: 'Sparkles / Polished', category: 'celebration' },
  { emoji: '⭐', name: 'Star / Bookmark', category: 'celebration' },
  { emoji: '💪', name: 'Strong / Keep it up', category: 'celebration' },
  { emoji: '🥳', name: 'Celebrate / Win', category: 'celebration' },
  { emoji: '🏆', name: 'Trophy / Winner', category: 'celebration' },

  { emoji: '💡', name: 'Idea / Innovation', category: 'work' },
  { emoji: '⚡', name: 'Lightning / High Priority', category: 'work' },
  { emoji: '📌', name: 'Pin / Note', category: 'work' },
  { emoji: '🔍', name: 'Investigating / Search', category: 'work' },
  { emoji: '💻', name: 'Coding / Engineering', category: 'work' },
  { emoji: '🎨', name: 'Design / UI / Token', category: 'work' },
  { emoji: '📊', name: 'Metrics / Dashboard', category: 'work' },
  { emoji: '🛠️', name: 'Fixing / Maintenance', category: 'work' },
  { emoji: '📝', name: 'Documenting / Notes', category: 'work' },
  { emoji: '⏱️', name: 'Timing / Countdown', category: 'work' },

  { emoji: '😊', name: 'Smile / Friendly', category: 'faces' },
  { emoji: '😎', name: 'Cool / Confident', category: 'faces' },
  { emoji: '🤔', name: 'Thinking / Pondering', category: 'faces' },
  { emoji: '🤩', name: 'Star-struck / Impressed', category: 'faces' },
  { emoji: '😂', name: 'Joy / Laughing', category: 'faces' },
  { emoji: '☕', name: 'Coffee / Break', category: 'faces' },
  { emoji: '🙏', name: 'Thank You / Grateful', category: 'faces' },
];

export const TEAM_ACK_SHORTCUTS = [
  { emoji: '👍', label: 'Acknowledged', desc: 'Seen & noted' },
  { emoji: '👀', label: 'Reviewing', desc: 'Looking into it' },
  { emoji: '✅', label: 'Approved', desc: 'Looks great to ship' },
  { emoji: '🚀', label: 'Shipped', desc: 'Live in production' },
  { emoji: '🔥', label: 'Awesome', desc: 'Outstanding execution' },
  { emoji: '❤️', label: 'Love it', desc: 'Heart felt agreement' },
];

export const EmojiReactionPicker: React.FC<EmojiReactionPickerProps> = ({
  onSelectEmoji,
  onClose,
  position = 'top-right',
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'acks' | 'celebration' | 'work' | 'faces'>('all');

  const filteredEmojis = useMemo(() => {
    return EMOJI_DATABASE.filter((item) => {
      const matchesSearch =
        search.trim() === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.shortcut?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeTab === 'all' || item.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeTab]);

  const positionClasses = {
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
  }[position];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={`absolute z-40 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden select-none ${positionClasses}`}
      onClick={(e) => e.stopPropagation()}
    >

      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Instant Reaction & Ack</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Close emoji picker"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex items-center">
          <FiSearch className="absolute left-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reactions (e.g. ack, check, fire)..."
            autoFocus
            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <FiX className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {!search && (
        <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              One-Tap Team Acknowledgment
            </span>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-500">
              Instant Sync
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {TEAM_ACK_SHORTCUTS.slice(0, 6).map((ack) => (
              <button
                key={ack.label}
                type="button"
                onClick={() => {
                  onSelectEmoji(ack.emoji);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 hover:border-emerald-400 text-left transition-all active:scale-95 group"
              >
                <span className="text-base group-hover:scale-125 transition-transform">
                  {ack.emoji}
                </span>
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {ack.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${activeTab === 'all'
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          All ({EMOJI_DATABASE.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('acks')}
          className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${activeTab === 'acks'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          ⚡ Acks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('celebration')}
          className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${activeTab === 'celebration'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          🎉 Energy
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('work')}
          className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${activeTab === 'work'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          💼 Work
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faces')}
          className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${activeTab === 'faces'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          😄 Mood
        </button>
      </div>

      <div className="p-3 max-h-48 overflow-y-auto grid grid-cols-6 gap-2">
        {filteredEmojis.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => {
              onSelectEmoji(item.emoji);
              onClose();
            }}
            title={item.name}
            className="flex items-center justify-center p-2 rounded-xl text-xl hover:bg-emerald-50 dark:hover:bg-slate-800 hover:scale-125 transition-all active:scale-95 group relative"
          >
            <span>{item.emoji}</span>
          </button>
        ))}

        {filteredEmojis.length === 0 && (
          <div className="col-span-6 py-6 text-center text-xs text-slate-400">
            No emojis match "{search}"
          </div>
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[10px] text-slate-400">
        <span>Click an emoji to acknowledge</span>
        <span className="font-mono">ESC to dismiss</span>
      </div>
    </motion.div>
  );
};
