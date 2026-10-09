import React, { useState } from 'react';
import { LeftDock } from '../components/layout/LeftDock';
import { ChatList } from '../components/chat/ChatList';
import { ChatCanvas } from '../components/chat/ChatCanvas';
import { ContactInfo } from '../components/chat/ContactInfo';
import { MobileHeader } from '../components/layout/MobileHeader';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { StoriesRow } from '../components/status/StoriesRow';
import { ActiveCallModal } from '../components/common/ActiveCallModal';
import { StoryModal } from '../components/common/StoryModal';
import { ComposeModal } from '../components/common/ComposeModal';
import { NotificationsModal } from '../components/common/NotificationsModal';
import { useChat } from '../context/ChatContext';
import { FiEdit3 } from 'react-icons/fi';

export const ChatPage: React.FC = () => {
  const { isInfoPanelOpen, setIsInfoPanelOpen } = useChat();
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);

  const handleSelectConversationMobile = (_id: string) => {
    setMobileThreadOpen(true);
  };

  const handleBackMobile = () => {
    setMobileThreadOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      <div className="hidden md:flex h-full">
        <LeftDock />
      </div>
      <div className="flex-1 flex flex-col md:flex-row h-full min-w-0 overflow-hidden relative">
        {mobileThreadOpen ? (
          <div className="flex-1 flex flex-col h-full md:hidden overflow-hidden relative">
            {isInfoPanelOpen ? (
              <ContactInfo />
            ) : (
              <ChatCanvas onBackMobile={handleBackMobile} />
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full md:hidden pb-16 w-full min-w-0 overflow-hidden">
            <MobileHeader title="Chatly" subtitle="Chats" />
            <StoriesRow />
            <div className="flex-1 overflow-y-auto w-full min-w-0">
              <ChatList onSelectConversation={handleSelectConversationMobile} />
            </div>
            <button
              type="button"
              onClick={() => setShowComposeModal(true)}
              className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-xl shadow-emerald-950/40 active:scale-95 transition-transform z-30 cursor-pointer"
              title="Compose Chat"
            >
              <FiEdit3 className="w-6 h-6" />
            </button>

            <MobileBottomNav />
          </div>
        )}
        <div className="hidden md:flex h-full shrink-0">
          <ChatList />
        </div>
        <div className="hidden md:flex flex-1 h-full min-w-0 bg-[#f8fafc] dark:bg-slate-950">
          {isInfoPanelOpen ? (
            <ContactInfo />
          ) : (
            <ChatCanvas />
          )}
        </div>
      </div>
      <StoryModal />
      <NotificationsModal />
      <ComposeModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onChatSelected={() => setMobileThreadOpen(true)}
      />
    </div>
  );
};
