import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftDock } from '../components/layout/LeftDock';
import { MobileHeader } from '../components/layout/MobileHeader';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { useChat } from '../context/ChatContext';
import { Avatar } from '../components/common/Avatar';
import {
  FiPlus,
  FiCamera,
  FiVideo,
  FiType,
  FiEye,
  FiX,
  FiClock,
  FiArrowLeft,
  FiCheck,
} from 'react-icons/fi';
import { ActiveCallModal } from '../components/common/ActiveCallModal';
import { StoryModal } from '../components/common/StoryModal';
import { NotificationsModal } from '../components/common/NotificationsModal';
import { uploadFileApi } from '../api/client';
import { toast } from 'react-toastify';

const BG_COLOR_PRESETS = [
  { name: 'Emerald', value: '#065f46' },
  { name: 'Purple', value: '#581c87' },
  { name: 'Midnight', value: '#1e3a8a' },
  { name: 'Crimson', value: '#881337' },
  { name: 'Charcoal', value: '#1e293b' },
  { name: 'Amber', value: '#78350f' },
];

export const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { stories, setActiveStory, postStatus } = useChat();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCreateTab, setActiveCreateTab] = useState<'text' | 'image' | 'video'>('text');
  const [statusText, setStatusText] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState(BG_COLOR_PRESETS[0].value);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMyViewersModal, setShowMyViewersModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ownStory = stories.find((s) => s.isOwn);
  const otherStories = stories.filter((s) => !s.isOwn);

  const totalMyViews =
    ownStory?.items?.reduce((acc, item) => acc + (item.viewersCount || item.viewers?.length || 0), 0) || 0;

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setStatusText('');
    setCaption('');
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handlePublishStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeCreateTab === 'text') {
        if (!statusText.trim()) {
          toast.error('Please enter status text');
          setIsSubmitting(false);
          return;
        }
        await postStatus({
          type: 'text',
          text: statusText.trim(),
          bgColor: selectedBgColor,
        });
      } else {
        if (!mediaFile) {
          toast.error(`Please select a ${activeCreateTab} file`);
          setIsSubmitting(false);
          return;
        }
        const uploadRes = await uploadFileApi(mediaFile);
        await postStatus({
          type: activeCreateTab,
          text: caption.trim(),
          mediaUrl: uploadRes.url,
        });
      }

      toast.success('Status published successfully!');
      handleCloseCreateModal();
    } catch (err: any) {
      toast.error('Failed to post status: ' + (err.message || 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="hidden md:flex h-full">
        <LeftDock />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 pb-16 md:pb-0 overflow-hidden">
        <MobileHeader title="Chatly" subtitle="Status & Updates" />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                title="Back to chats"
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  End-to-end encrypted updates that expire after 24 hours.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Status</span>
            </button>
          </div>

          {/* My Status Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between shadow-xs mb-6">
            <div
              onClick={() => (ownStory ? setActiveStory(ownStory) : setShowCreateModal(true))}
              className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0 group"
            >
              <div className="relative shrink-0">
                <Avatar name={ownStory?.userName || 'My Status'} avatarUrl={ownStory?.userAvatar} size="lg" />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900">
                  +
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                  My Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {ownStory?.items[0]?.content ? (
                    ownStory.items[0].type === 'image'
                      ? '📷 Photo status'
                      : ownStory.items[0].type === 'video'
                      ? '🎥 Video status'
                      : ownStory.items[0].content
                  ) : (
                    'Tap to add status update'
                  )}
                </p>
              </div>
            </div>

            {/* Seen By Counter / Viewers Trigger */}
            {ownStory && ownStory.items.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMyViewersModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 text-xs font-semibold transition-colors cursor-pointer shrink-0 ml-2"
                title="View seen list"
              >
                <FiEye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{totalMyViews} viewed</span>
              </button>
            )}
          </div>

          {/* Recent Updates from Contacts */}
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Recent updates
          </h3>

          <div className="space-y-2">
            {otherStories.length > 0 ? (
              otherStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setActiveStory(story)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-0.5 rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shrink-0">
                      <Avatar name={story.userName} avatarUrl={story.userAvatar} size="md" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {story.userName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {story.items[0]?.timeAgo || story.timeAgo}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
                    View
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                <span>No recent updates from your contacts</span>
              </div>
            )}
          </div>
        </div>

        <MobileBottomNav />
      </div>

      {/* Create Status Modal (Supports Text, Image, Video) */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={handleCloseCreateModal}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                New Status Update
              </h3>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Type Tabs: Text, Image, Video */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setActiveCreateTab('text');
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeCreateTab === 'text'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FiType className="w-4 h-4" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCreateTab('image');
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeCreateTab === 'image'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FiCamera className="w-4 h-4" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCreateTab('video');
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeCreateTab === 'video'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FiVideo className="w-4 h-4" />
                <span>Video</span>
              </button>
            </div>

            <form onSubmit={handlePublishStatus} className="space-y-4">
              {activeCreateTab === 'text' ? (
                <>
                  {/* Text Status Area with Color Picker */}
                  <div
                    style={{ backgroundColor: selectedBgColor }}
                    className="w-full h-44 rounded-2xl p-4 flex items-center justify-center transition-colors shadow-inner"
                  >
                    <textarea
                      rows={4}
                      required
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      placeholder="Type a status..."
                      className="w-full bg-transparent text-center font-bold text-lg text-white placeholder:text-white/60 focus:outline-none resize-none drop-shadow-md"
                    />
                  </div>

                  {/* WhatsApp Color Palette Picker */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {BG_COLOR_PRESETS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedBgColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          selectedBgColor === c.value ? 'scale-125 border-white shadow-md' : 'border-transparent'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Media Upload Area */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept={activeCreateTab === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleMediaSelect}
                    className="hidden"
                  />

                  {mediaPreview ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-700">
                      {activeCreateTab === 'image' ? (
                        <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <video src={mediaPreview} controls className="max-h-full max-w-full object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMediaFile(null);
                          setMediaPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                    >
                      {activeCreateTab === 'image' ? (
                        <FiCamera className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <FiVideo className="w-8 h-8 text-emerald-600" />
                      )}
                      <span className="text-xs font-semibold">
                        Choose {activeCreateTab === 'image' ? 'a photo' : 'a video'} from device
                      </span>
                      <span className="text-[10px] text-slate-400">Up to 50MB</span>
                    </div>
                  )}

                  {/* Caption Input */}
                  <div>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      <span>Publish Status</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewers List Modal (When user taps "Seen by X") */}
      {showMyViewersModal && ownStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowMyViewersModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FiEye className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Status Viewers ({totalMyViews})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMyViewersModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {ownStory.items.some((it) => it.viewers && it.viewers.length > 0) ? (
                ownStory.items.flatMap((it) =>
                  (it.viewers || []).map((v: any, idx: number) => {
                    const viewerUser = v.userId || {};
                    const viewerName = viewerUser.fullName || viewerUser.name || 'User';
                    const viewerAvatar = viewerUser.profileImage?.url || viewerUser.profileImage;

                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={viewerName} avatarUrl={viewerAvatar} size="sm" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {viewerName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{viewerUser.email || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 ml-2">
                          <FiClock className="w-3 h-3 text-emerald-500" />
                          <span>
                            {v.viewedAt ? new Date(v.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  <FiEye className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p>No views yet on your status</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <StoryModal />
      <NotificationsModal />
    </div>
  );
};
