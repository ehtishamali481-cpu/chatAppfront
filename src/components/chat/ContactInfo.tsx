import React, { useEffect, useState } from 'react';
import {
  FiX,
  FiArrowLeft,
  FiPhone,
  FiVideo,
  FiSearch,
  FiBellOff,
  FiBell,
  FiStar,
  FiShield,
  FiSlash,
  FiFileText,
  FiExternalLink,
  FiArchive,
  FiInbox,
  FiDownload,
} from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { getUserByIdApi } from '../../api/client';
import { FiInfo } from 'react-icons/fi';

export const ContactInfo: React.FC = () => {
  const {
    activeConversation,
    messages,
    toggleInfoPanel,
    startCall,
    toggleMuteConversation,
    toggleArchiveConversation,
    blockContact,
  } = useChat();

  const [activeAssetTab, setActiveAssetTab] = useState<'media' | 'docs' | 'links'>('media');
  const [selectedAssetModal, setSelectedAssetModal] = useState<any | null>(null);
  const [contactUser, setContactUser] = useState<any>(null);

  useEffect(() => {
    if (!activeConversation || activeConversation.isGroup) return;
    const targetUserId = activeConversation.otherUserId;
    if (targetUserId) {
      getUserByIdApi(targetUserId)
        .then((u) => setContactUser(u))
        .catch(() => { });
    }
  }, [activeConversation]);

  if (!activeConversation) return null;

  const conv = activeConversation;
  const isMuted = conv.muted;

  const displayAbout =
    contactUser?.about ||
    conv.about ||
    conv.bio ||
    'Hey there! I am using WhatsApp.';

  const displayAboutUpdatedAt =
    contactUser?.aboutUpdatedAt ||
    contactUser?.updatedAt ||
    conv.aboutUpdatedAt;

  const formatContactAboutDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0) return `Today at ${timeStr}`;
    if (diffDays === 1) return `Yesterday at ${timeStr}`;
    return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`;
  };

  const realMedia = messages.filter(
    (m) =>
      m.attachment?.url &&
      (m.type === 'image' ||
        m.attachment.type?.toLowerCase().includes('image') ||
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(m.attachment.name || ''))
  );

  const realDocs = messages.filter(
    (m) =>
      m.attachment?.url &&
      m.type !== 'image' &&
      !m.attachment.type?.toLowerCase().includes('image') &&
      !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(m.attachment.name || '')
  );

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const realLinks = messages
    .filter((m) => m.content && urlRegex.test(m.content))
    .flatMap((m) => {
      const matches = m.content.match(urlRegex) || [];
      return matches.map((url) => ({
        id: `${m.id}_${url}`,
        url,
        timestamp: m.timestamp,
      }));
    });

  const totalAssetsCount = realMedia.length + realDocs.length + realLinks.length;
  const pinnedCount = messages.filter((m) => m.isPinned).length;

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200/90 dark:border-slate-800 flex flex-col overflow-y-auto select-none">
      <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleInfoPanel}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Back to messages"
          >
            <FiArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Back to Messages</span>
          </button>
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Contact Details</h2>
        <button
          type="button"
          onClick={toggleInfoPanel}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close details"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 flex flex-col items-center text-center border-b border-slate-100 dark:border-slate-800">
        <Avatar
          name={conv.name}
          avatarUrl={conv.avatar}
          size="xl"
          online={conv.online}
          className="mb-3 shadow-md"
        />

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{conv.name}</h3>
        {conv.phone && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{conv.phone}</p>
        )}
        {conv.handle && (
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
            {conv.handle}
          </span>
        )}
        <div className="w-full mt-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            <FiInfo className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>About</span>
          </div>
          <p className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
            {displayAbout}
          </p>
          {displayAboutUpdatedAt && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Last updated:</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {formatContactAboutDate(displayAboutUpdatedAt)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 w-full mt-5">
          <button
            type="button"
            onClick={() => startCall(conv, 'audio')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
              <FiPhone className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Audio</span>
          </button>

          <button
            type="button"
            onClick={() => startCall(conv, 'video')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
              <FiVideo className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Video</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
              <FiSearch className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Search</span>
          </button>

          <button
            type="button"
            onClick={() => toggleMuteConversation(conv.id)}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-xs ${isMuted
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white'
                }`}
            >
              {isMuted ? <FiBellOff className="w-4 h-4" /> : <FiBell className="w-4 h-4" />}
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {isMuted ? 'Muted' : 'Mute'}
            </span>
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Shared Assets
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {totalAssetsCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs border-b border-slate-200 dark:border-slate-800 mb-3">
          <button
            type="button"
            onClick={() => setActiveAssetTab('media')}
            className={`pb-2 px-1 font-medium transition-colors cursor-pointer ${activeAssetTab === 'media'
              ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
          >
            Media ({realMedia.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveAssetTab('docs')}
            className={`pb-2 px-1 font-medium transition-colors cursor-pointer ${activeAssetTab === 'docs'
              ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
          >
            Docs ({realDocs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveAssetTab('links')}
            className={`pb-2 px-1 font-medium transition-colors cursor-pointer ${activeAssetTab === 'links'
              ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
          >
            Links ({realLinks.length})
          </button>
        </div>

        {activeAssetTab === 'media' && (
          <div>
            {realMedia.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No shared images in this chat yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {realMedia.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedAssetModal(m)}
                    className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                  >
                    <img
                      src={m.attachment?.url}
                      alt={m.attachment?.name || 'Shared Media'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium truncate px-1">
                        {m.attachment?.name || 'Image'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeAssetTab === 'docs' && (
          <div className="space-y-2">
            {realDocs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No documents shared yet</p>
            ) : (
              realDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FiFileText className="text-emerald-600 w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {doc.attachment?.name || 'Document'}
                      </p>
                      <p className="text-[10px] text-slate-400">{doc.attachment?.size || doc.timestamp}</p>
                    </div>
                  </div>
                  {doc.attachment?.url && (
                    <a
                      href={doc.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Download file"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeAssetTab === 'links' && (
          <div className="space-y-2">
            {realLinks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No shared links yet</p>
            ) : (
              realLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="truncate mr-2">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                      {item.url}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.timestamp}</p>
                  </div>
                  <FiExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </a>
              ))
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-full flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <FiStar className="text-amber-500 w-4 h-4" />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Pinned Messages
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400">{pinnedCount}</span>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleArchiveConversation(conv.id)}
          className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${conv.archived
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
        >
          <div className="flex items-center gap-2.5">
            {conv.archived ? (
              <FiInbox className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FiArchive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{conv.archived ? 'Unarchive Conversation' : 'Archive Conversation'}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            {conv.archived ? 'Archived' : 'Active'}
          </span>
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
          <FiShield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              End-to-End Encryption
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Fingerprint verified. All communications are private between you and {conv.name}.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <button
          type="button"
          onClick={() => blockContact(conv.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
        >
          <FiSlash className="w-4 h-4" />
          <span>Block {conv.name}</span>
        </button>
      </div>

      {selectedAssetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setSelectedAssetModal(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full aspect-square rounded-xl bg-black overflow-hidden flex items-center justify-center mb-3">
              <img
                src={selectedAssetModal.attachment?.url}
                alt={selectedAssetModal.attachment?.name || 'Preview'}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {selectedAssetModal.attachment?.name || 'Image'}
                </h4>
                <p className="text-xs text-slate-500">{selectedAssetModal.timestamp}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssetModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
