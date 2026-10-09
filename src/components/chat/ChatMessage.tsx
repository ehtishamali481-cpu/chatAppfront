import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDownload,
  FiCheck,
  FiMoreVertical,
  FiSmile,
  FiPlus,
  FiCopy,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiTrash,
  FiCornerUpLeft,
  FiFileText,
  FiFilm,
  FiArchive,
  FiCode,
  FiImage,
  FiMaximize2,
  FiX,
} from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { BsCheckAll, BsPinAngle, BsPinFill } from 'react-icons/bs';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileZipper } from 'react-icons/fa6';
import { Message } from '../../types';
import { AudioPlayer } from './AudioPlayer';
import { EmojiReactionPicker } from './EmojiReactionPicker';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface ChatMessageProps {
  message: Message;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-xs shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="font-semibold text-emerald-400 uppercase tracking-wider">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[12px] font-mono text-emerald-300/90 leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const QUICK_ACK_EMOJIS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '👀', label: 'Looking' },
  { emoji: '✅', label: 'Approved' },
];

const USER_NAME_MAP: Record<string, string> = {
  user_sarah: 'You',
  user_elena: 'Elena Rostova',
  user_marcus: 'Marcus Vance',
  user_david: 'David Chen',
  user_clara: 'Clara Oswald',
};

const renderFormattedMessage = (content: string, isAi: boolean) => {
  if (!isAi) {
    return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0]?.trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : '';
          const code = (hasLang ? lines.slice(1) : lines).join('\n');
          return <CodeBlock key={pIdx} code={code} language={lang} />;
        }

        const textLines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {textLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-2 mb-1 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span>{trimmed.slice(4)}</span>
                  </h4>
                );
              }
              if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                return (
                  <h3 key={lIdx} className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base mt-2 mb-1 text-emerald-700 dark:text-emerald-300">
                    <span>{trimmed.replace(/^#+\s*/, '')}</span>
                  </h3>
                );
              }

              const isBullet = /^[*-]\s+/.test(trimmed);
              const isNumbered = /^\d+\.\s+/.test(trimmed);
              const lineText = isBullet ? trimmed.replace(/^[*-]\s+/, '') : isNumbered ? trimmed.replace(/^\d+\.\s+/, '') : line;

              const inlineTokens = lineText.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

              const renderedInline = inlineTokens.map((tok, tIdx) => {
                if (tok.startsWith('**') && tok.endsWith('**')) {
                  return <strong key={tIdx} className="font-bold text-slate-900 dark:text-white">{tok.slice(2, -2)}</strong>;
                }
                if (tok.startsWith('`') && tok.endsWith('`')) {
                  return (
                    <code key={tIdx} className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-mono text-[11.5px]">
                      {tok.slice(1, -1)}
                    </code>
                  );
                }
                return tok;
              });

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="flex-1">{renderedInline}</span>
                  </div>
                );
              }

              if (isNumbered) {
                const num = trimmed.match(/^\d+/)?.[0] || '1';
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 min-w-4">{num}.</span>
                    <span className="flex-1">{renderedInline}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="leading-relaxed">{renderedInline}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const {
    toggleReaction,
    togglePinMessage,
    setReplyingToMessage,
    editMessage,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useChat();

  const [showFullPicker, setShowFullPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [hoveredReactionEmoji, setHoveredReactionEmoji] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiCopied, setAiCopied] = useState(false);

  const currentUserId = user?.id || '';
  const isMe = Boolean(user?.id && (message.senderId === user.id || message.senderId === 'current_user'));
  const isAi = message.senderId === 'chatly_ai' || message.senderName === 'Chatly AI';

  const isImageAttachment =
    message.type === 'image' ||
    (message.attachment && (
      message.attachment.type?.toLowerCase().includes('image') ||
      message.attachment.url?.startsWith('data:image') ||
      message.attachment.name?.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)
    ));

  const renderAttachmentIcon = (type: string = '', name: string = '') => {
    const lowerType = type.toLowerCase();
    const lowerName = name.toLowerCase();

    if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 text-xl shadow-xs">
          <FaFilePdf />
        </div>
      );
    }
    if (lowerType.includes('word') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-xl shadow-xs">
          <FaFileWord />
        </div>
      );
    }
    if (lowerType.includes('excel') || lowerType.includes('spreadsheet') || lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xl shadow-xs">
          <FaFileExcel />
        </div>
      );
    }
    if (lowerType.includes('zip') || lowerType.includes('archive') || lowerName.endsWith('.zip') || lowerName.endsWith('.rar') || lowerName.endsWith('.tar') || lowerName.endsWith('.gz')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 text-xl shadow-xs">
          <FaFileZipper />
        </div>
      );
    }
    if (lowerType.includes('video') || lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || lowerName.endsWith('.webm')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 text-xl shadow-xs">
          <FiFilm />
        </div>
      );
    }
    if (lowerType.includes('code') || lowerName.match(/\.(js|ts|tsx|jsx|json|py|html|css|sql)$/)) {
      return (
        <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 text-xl shadow-xs">
          <FiCode />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 text-xl shadow-xs">
        <FiFileText />
      </div>
    );
  };

  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const isWithin5Minutes = Boolean(
    message.createdAt
      ? Date.now() - message.createdAt <= FIVE_MINUTES_MS
      : message.timestamp === 'Just now'
  );

  const canEdit = isMe && isWithin5Minutes && !message.isDeleted;
  const canDeleteForEveryone = isMe && isWithin5Minutes && !message.isDeleted;

  useEffect(() => {
    if (!showMenu) return;
    const handleDocClick = () => setShowMenu(false);
    window.addEventListener('click', handleDocClick);
    return () => window.removeEventListener('click', handleDocClick);
  }, [showMenu]);

  const formatReactionUsers = (users: string[] = []): string => {
    if (!users || users.length === 0) return '1 member';
    const names = users.map((uid) => (uid === currentUserId ? 'You' : USER_NAME_MAP[uid] || uid));
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names[0]}, ${names[1]} +${names.length - 2} more`;
  };

  const handleCopyMessage = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      editMessage(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group relative flex flex-col mb-4 max-w-full ${isMe ? 'items-end' : 'items-start'
        }`}
    >
      {!message.isDeleted && !isEditing && (
        <div
          className={`absolute -top-3.5 z-20 opacity-0 group-hover:opacity-100 sm:opacity-0 focus-within:opacity-100 transition-opacity ${showMenu ? '!opacity-100' : ''
            } ${isMe ? 'right-2' : 'left-2'}`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Message options"
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>
        </div>
      )}

      {showMenu && (
        <div
          className={`absolute top-2 z-40 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 ${isMe ? 'right-0' : 'left-0'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            {QUICK_ACK_EMOJIS.map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  toggleReaction(message.id, emoji);
                  setShowMenu(false);
                }}
                className="hover:scale-125 transition-transform text-base p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title={label}
              >
                {emoji}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                setShowFullPicker(true);
              }}
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs cursor-pointer"
              title="More emojis"
            >
              <FiSmile className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setReplyingToMessage(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FiCornerUpLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Reply to message</span>
          </button>

          {isMe && (
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                setIsEditing(true);
                setEditContent(message.content);
                setShowMenu(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${canEdit
                  ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                }`}
              title={canEdit ? 'Edit message within 5 minutes' : 'Editing expired (allowed within 5 min only)'}
            >
              <div className="flex items-center gap-2">
                <FiEdit2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Edit message</span>
              </div>
              {!canEdit && (
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">&gt;5m</span>
              )}
            </button>
          )}

          {isMe && (
            <button
              type="button"
              disabled={!canDeleteForEveryone}
              onClick={() => {
                if (!canDeleteForEveryone) return;
                deleteMessageForEveryone(message.id);
                setShowMenu(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${canDeleteForEveryone
                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                }`}
              title={canDeleteForEveryone ? 'Delete for everyone within 5 minutes' : 'Delete for everyone expired (>5m)'}
            >
              <div className="flex items-center gap-2">
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Delete for everyone</span>
              </div>
              {!canDeleteForEveryone && (
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">&gt;5m</span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              deleteMessageForMe(message.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FiTrash className="w-3.5 h-3.5" />
            <span>Delete for me</span>
          </button>
          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
          <button
            type="button"
            onClick={() => {
              handleCopyMessage();
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FiCopy className="w-3.5 h-3.5" />
            <span>Copy text</span>
          </button>
          <button
            type="button"
            onClick={() => {
              togglePinMessage(message.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <BsPinAngle className="w-3.5 h-3.5" />
            <span>{message.isPinned ? 'Unpin' : 'Pin message'}</span>
          </button>
        </div>
      )}
      <AnimatePresence>
        {showFullPicker && (
          <div className="relative">
            <EmojiReactionPicker
              position={isMe ? 'top-right' : 'top-left'}
              onSelectEmoji={(emoji) => {
                toggleReaction(message.id, emoji);
              }}
              onClose={() => setShowFullPicker(false)}
            />
          </div>
        )}
      </AnimatePresence>
      <div
        className={`relative text-sm rounded-[18px] max-w-[88%] sm:max-w-xl transition-all ${message.isDeleted
            ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 italic border border-slate-200 dark:border-slate-700/60 p-3'
            : isMe
              ? 'bg-emerald-100/90 text-slate-900 border border-emerald-200/90 dark:bg-emerald-950/60 dark:text-emerald-50 dark:border-emerald-800/80 rounded-br-xs shadow-xs p-3.5'
              : isAi
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-2xl rounded-bl-xs shadow-xs p-3.5'
                : 'bg-white text-slate-900 border border-slate-200/90 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 rounded-bl-xs shadow-xs p-3.5'
          }`}
      >
        {isAi && !isEditing && (
          <div className="flex items-center justify-between pb-1.5 mb-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Chatly AI</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(message.content);
                setAiCopied(true);
                setTimeout(() => setAiCopied(false), 2000);
              }}
              className="flex items-center gap-1 p-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy response"
            >
              {aiCopied ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
            </button>
          </div>
        )}
        {isEditing ? (
          <div className="space-y-2 min-w-[240px] sm:min-w-[280px]">
            <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
              <span>Edit message</span>
              <span className="text-[10px] text-slate-500 font-normal">Within 5m window</span>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.type === 'quote' && message.quote && (
              <div className="border-l-3 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 pl-3 py-1.5 pr-2 rounded-r-lg mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-0.5">
                  <FiCornerUpLeft className="w-3 h-3" />
                  <span>{message.quote.title}</span>
                </div>
                <p className="text-xs italic text-slate-700 dark:text-slate-300 font-sans line-clamp-2">
                  {message.quote.text}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-slate-400 font-mono">
                  <span>{message.quote.time}</span>
                </div>
              </div>
            )}
            {message.content && renderFormattedMessage(message.content, isAi)}
            {isImageAttachment && message.attachment?.url && (
              <div className="mt-2 relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 bg-slate-900/10 dark:bg-slate-950/60 max-w-sm group/img shadow-xs">
                <img
                  src={message.attachment.url}
                  alt={message.attachment.name || 'Shared image'}
                  className="w-full max-h-72 object-cover rounded-2xl cursor-pointer transition-transform duration-200 group-hover/img:scale-[1.02]"
                  onClick={() => setPreviewImage(message.attachment?.url || null)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity p-2.5 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-center justify-between text-white text-xs font-semibold drop-shadow-md">
                    <span className="truncate max-w-[200px]">{message.attachment.name}</span>
                    <span className="text-[10px] font-mono opacity-80">{message.attachment.size}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(message.attachment?.url || null)}
                      className="p-1.5 rounded-full bg-white/90 text-slate-800 hover:bg-white transition-all shadow-md cursor-pointer"
                      title="View full image"
                    >
                      <FiMaximize2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={message.attachment.url}
                      download={message.attachment.name || 'image.png'}
                      className="p-1.5 rounded-full bg-white/90 text-slate-800 hover:bg-white transition-all shadow-md cursor-pointer"
                      title="Download image"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
            {!isImageAttachment && message.attachment && (
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  {renderAttachmentIcon(message.attachment.type, message.attachment.name)}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                      {message.attachment.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {message.attachment.size} • {message.attachment.type || 'Document'}
                      {message.attachment.pages ? ` (${message.attachment.pages} page${message.attachment.pages > 1 ? 's' : ''})` : ''}
                    </p>
                  </div>
                </div>

                <a
                  href={message.attachment.url || '#download'}
                  download={message.attachment.name || 'download'}
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xs shrink-0 transition-colors"
                  title={`Download ${message.attachment.name}`}
                >
                  <FiDownload className="w-4 h-4" />
                </a>
              </div>
            )}
            {message.type === 'audio' && message.audio && (
              <AudioPlayer
                duration={message.audio.duration}
                waveform={message.audio.waveform}
                senderName={message.senderName}
                senderAvatar={message.senderAvatar}
              />
            )}
          </>
        )}
        <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[11px] text-slate-400 dark:text-slate-400 font-mono">
          {message.isEdited && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">edited</span>
          )}
          <span>{message.timestamp}</span>
          {isMe && !message.isDeleted && (
            <span
              className="inline-flex items-center ml-0.5"
              title={
                message.status === 'pending'
                  ? 'Pending sync'
                  : message.status === 'read'
                    ? 'Read'
                    : message.status === 'delivered'
                      ? 'Delivered'
                      : 'Sent'
              }
            >
              {message.status === 'pending' ? (
                <FiClock className="text-amber-500 text-xs animate-pulse" />
              ) : message.status === 'read' ? (
                <BsCheckAll className="text-sky-500 dark:text-sky-400 text-base" />
              ) : message.status === 'delivered' ? (
                <BsCheckAll className="text-slate-400 dark:text-slate-400 text-base" />
              ) : (
                <FiCheck className="text-slate-400 dark:text-slate-400 text-sm" />
              )}
            </span>
          )}
        </div>
      </div>
      {message.reactions && message.reactions.length > 0 && (
        <div
          className={`flex items-center flex-wrap gap-1.5 mt-1.5 max-w-[95%] sm:max-w-xl ${isMe ? 'justify-end pr-1' : 'justify-start pl-1'
            }`}
        >
          {message.reactions.map((react, i) => {
            const hasUserReacted = react.users?.includes(currentUserId);
            const userTooltip = formatReactionUsers(react.users);
            const isHovered = hoveredReactionEmoji === react.emoji;

            return (
              <div key={i} className="relative inline-block">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onMouseEnter={() => setHoveredReactionEmoji(react.emoji)}
                  onMouseLeave={() => setHoveredReactionEmoji(null)}
                  onClick={() => toggleReaction(message.id, react.emoji)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all select-none shadow-xs ${hasUserReacted
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-500 font-semibold ring-1 ring-emerald-400/30'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-600'
                    }`}
                  title={`${userTooltip} reacted with ${react.emoji} (Click to ${hasUserReacted ? 'remove' : 'add'} acknowledgment)`}
                >
                  <span className="text-sm">{react.emoji}</span>
                  <span className="font-bold text-[11px] font-mono leading-none">
                    {react.count}
                  </span>
                  {hasUserReacted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </motion.button>
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 2, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-medium whitespace-nowrap shadow-xl pointer-events-none flex items-center gap-1"
                    >
                      <span>{react.emoji}</span>
                      <span>{userTooltip}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setShowFullPicker((prev) => !prev)}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="Add another reaction"
          >
            <FiPlus className="w-3 h-3" />
          </button>
        </div>
      )}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <FiImage className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
                  {message.attachment?.name || 'Image Preview'}
                </span>
                {message.attachment?.size && (
                  <span className="text-xs text-slate-400 font-mono">
                    ({message.attachment.size})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={previewImage}
                  download={message.attachment?.name || 'image.png'}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Image"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};
