import React from 'react';
import { LeftDock } from '../components/layout/LeftDock';
import { MobileHeader } from '../components/layout/MobileHeader';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { useChat, CHATLY_AI_CONVERSATION } from '../context/ChatContext';
import { Avatar } from '../components/common/Avatar';
import { FiPhone, FiVideo, FiPhoneIncoming, FiPhoneOutgoing, FiPhoneMissed } from 'react-icons/fi';
import { ActiveCallModal } from '../components/common/ActiveCallModal';
import { StoryModal } from '../components/common/StoryModal';
import { NotificationsModal } from '../components/common/NotificationsModal';

export const CallsPage: React.FC = () => {
  const { callLogs, conversations, startCall } = useChat();

  const handleStartCallWithContact = (convId: string, type: 'audio' | 'video') => {
    const conv =
      convId === 'chatly_ai'
        ? CHATLY_AI_CONVERSATION
        : (conversations.find((c) => c.id === convId) || (convId.toLowerCase().includes('ai') ? CHATLY_AI_CONVERSATION : conversations[0]));
    if (conv) startCall(conv, type);
  };

  const displayLogs = callLogs;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="hidden md:flex h-full">
        <LeftDock />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 pb-16 md:pb-0 overflow-hidden">
        <MobileHeader title="Chatly" subtitle="Calls" />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Calls
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Recent Call Activity & Audio/Video History
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
            {displayLogs.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <FiPhone className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No call activity yet</p>
                <p className="text-xs text-slate-500 mt-0.5">Calls with your contacts and Chatly AI will appear here</p>
              </div>
            ) : (
              displayLogs.map((log) => {
                const isMissed = log.type === 'missed';
                const isOutgoing = log.type === 'outgoing';

                return (
                  <div
                    key={log.id}
                    className="p-3.5 sm:px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar name={log.name} avatarUrl={log.avatar} size="md" className="shrink-0" />
                      <div className="min-w-0">
                        <h4
                          className={`font-semibold text-sm truncate ${isMissed ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                            }`}
                        >
                          {log.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {isMissed && <FiPhoneMissed className="text-rose-500 w-3.5 h-3.5 shrink-0" />}
                          {isOutgoing && <FiPhoneOutgoing className="text-emerald-600 w-3.5 h-3.5 shrink-0" />}
                          {!isMissed && !isOutgoing && <FiPhoneIncoming className="text-blue-500 w-3.5 h-3.5 shrink-0" />}
                          <span className="truncate">{log.timestamp}</span>
                          {log.duration && log.duration !== 'Missed' && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[11px]">{log.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const targetId = log.conversationId || conversations[0]?.id;
                          if (targetId) handleStartCallWithContact(targetId, log.callType);
                        }}
                        className="p-2.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                        title={`Call ${log.name} (${log.callType})`}
                      >
                        {log.callType === 'video' ? (
                          <FiVideo className="w-5 h-5" />
                        ) : (
                          <FiPhone className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <MobileBottomNav />
      </div>
      <StoryModal />
      <NotificationsModal />
    </div>
  );
};
