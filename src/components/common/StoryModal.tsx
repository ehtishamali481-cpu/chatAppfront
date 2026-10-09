import React, { useState, useEffect } from 'react';
import { FiX, FiSend, FiChevronLeft, FiChevronRight, FiEye, FiClock, FiUser } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { Avatar } from './Avatar';

export const StoryModal: React.FC = () => {
  const { activeStory, setActiveStory, viewStatus } = useChat();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showViewersDrawer, setShowViewersDrawer] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setShowViewersDrawer(false);
  }, [activeStory]);

  const currentItem =
    activeStory && activeStory.items && activeStory.items.length > 0
      ? activeStory.items[currentIndex] || activeStory.items[0]
      : null;

  useEffect(() => {
    if (currentItem?.id && !activeStory?.isOwn && viewStatus) {
      viewStatus(currentItem.id);
    }
  }, [currentItem?.id, activeStory?.isOwn, viewStatus]);

  if (!activeStory || !activeStory.items || activeStory.items.length === 0 || !currentItem) {
    return null;
  }

  const handleNext = () => {
    if (currentIndex < activeStory.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setActiveStory(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyText('');
    setActiveStory(null);
  };

  const isVideo = currentItem.type === 'video' || Boolean(currentItem.content?.match(/\.(mp4|webm|mov|mkv)/i));
  const isImage = currentItem.type === 'image' || Boolean(currentItem.content?.match(/\.(jpg|jpeg|png|webp|gif)/i));

  const formatViewedTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
      onClick={() => setActiveStory(null)}
    >
      <div
        className="relative w-full max-w-sm h-[580px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 bg-gradient-to-b from-slate-900 to-black text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bars */}
        <div className="flex gap-1.5 w-full z-20">
          {activeStory.items.map((_: any, i: number) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full overflow-hidden transition-all ${i <= currentIndex ? 'bg-emerald-400' : 'bg-white/30'
                }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 z-20">
          <div className="flex items-center gap-2.5">
            <Avatar name={activeStory.userName} avatarUrl={activeStory.userAvatar} size="sm" />
            <div>
              <p className="font-bold text-sm leading-tight text-white">{activeStory.userName}</p>
              <p className="text-[11px] text-white/70">{currentItem?.timeAgo || activeStory.timeAgo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveStory(null)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
            title="Close (Esc)"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-2 z-10 relative overflow-hidden my-2">
          {isVideo ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden">
              <video
                src={currentItem.content}
                autoPlay
                playsInline
                controls
                className="max-h-full max-w-full object-contain"
              />
              {currentItem.caption && (
                <div className="absolute bottom-2 inset-x-2 p-2 bg-black/60 backdrop-blur-xs rounded-xl text-center text-xs text-white">
                  {currentItem.caption}
                </div>
              )}
            </div>
          ) : isImage ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden">
              <img
                src={currentItem.content}
                alt="Status Media"
                className="max-h-full max-w-full object-contain"
              />
              {currentItem.caption && (
                <div className="absolute bottom-2 inset-x-2 p-2 bg-black/60 backdrop-blur-xs rounded-xl text-center text-xs text-white">
                  {currentItem.caption}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: currentItem.bgColor?.startsWith('#') ? currentItem.bgColor : undefined,
              }}
              className={`w-full h-full rounded-2xl p-6 flex items-center justify-center ${!currentItem.bgColor?.startsWith('#')
                  ? currentItem.bgColor || 'bg-gradient-to-tr from-emerald-800 to-teal-900'
                  : ''
                } shadow-inner`}
            >
              <p className="text-xl font-bold leading-relaxed text-white drop-shadow-md whitespace-pre-wrap select-text">
                {currentItem.content}
              </p>
            </div>
          )}
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer z-30"
              title="Previous"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer z-30"
            title="Next"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
        {activeStory.isOwn ? (
          <div className="z-20 mt-1">
            <button
              type="button"
              onClick={() => setShowViewersDrawer(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-between text-xs text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FiEye className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">
                  {currentItem.viewersCount || currentItem.viewers?.length || 0} viewed
                </span>
              </div>
              <span className="text-[11px] text-white/70">Tap to see viewers &gt;</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendReply} className="flex items-center gap-2 mt-2 z-20">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${activeStory.userName}...`}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/15 border border-white/20 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md transition-colors cursor-pointer"
            >
              <FiSend className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        )}
        {showViewersDrawer && (
          <div
            className="absolute inset-x-0 bottom-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 max-h-72 overflow-y-auto z-40 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FiEye className="text-emerald-400" />
                <h4 className="font-bold text-xs text-white">
                  Viewed by ({currentItem.viewers?.length || 0})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowViewersDrawer(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 divide-y divide-slate-800/60">
              {currentItem.viewers && currentItem.viewers.length > 0 ? (
                currentItem.viewers.map((v: any, idx: number) => {
                  const viewerUser = v.userId || {};
                  const viewerName = viewerUser.fullName || viewerUser.name || 'User';
                  const viewerAvatar = viewerUser.profileImage?.url || viewerUser.profileImage;

                  return (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={viewerName} avatarUrl={viewerAvatar} size="sm" />
                        <div>
                          <p className="font-semibold text-white">{viewerName}</p>
                          <p className="text-[10px] text-slate-400">{viewerUser.email || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <FiClock className="w-3 h-3 text-emerald-400" />
                        <span>{formatViewedTime(v.viewedAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  <FiUser className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <span>No one has viewed this status yet</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
