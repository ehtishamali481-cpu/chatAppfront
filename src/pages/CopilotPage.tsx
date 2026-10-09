import React from 'react';
import { LeftDock } from '../components/layout/LeftDock';
import { MobileHeader } from '../components/layout/MobileHeader';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { CopilotWorkspace } from '../components/copilot/CopilotWorkspace';
import { CopilotView } from '../components/copilot/CopilotView';
import { ActiveCallModal } from '../components/common/ActiveCallModal';
import { StoryModal } from '../components/common/StoryModal';
import { NotificationsModal } from '../components/common/NotificationsModal';

export const CopilotPage: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      <div className="hidden md:flex flex-1 h-full min-w-0">
        <LeftDock />
        <CopilotWorkspace />
      </div>
      <div className="flex md:hidden flex-1 flex-col h-full min-w-0 pb-16 overflow-hidden">
        <MobileHeader title="Chatly" subtitle="Chatly AI" />
        <CopilotView />
        <MobileBottomNav />
      </div>
      <StoryModal />
      <NotificationsModal />
    </div>
  );
};
