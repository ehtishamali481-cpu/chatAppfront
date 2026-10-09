import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { StoryStatus } from '../../types';

export const StoriesRow: React.FC = () => {
  const { stories, setActiveStory } = useChat();

  return (
    <div className="py-3 px-4 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 select-none">
      <div className="flex items-center gap-4 min-w-max">
        {stories.map((story) => {
          if (story.isOwn) {
            return (
              <div
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div className="relative">
                  <Avatar name={story.userName} size="lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                    <FiPlus className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {story.userName}
                </span>
              </div>
            );
          }

          return (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="relative p-0.5 rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-transform group-hover:scale-105">
                <Avatar name={story.userName} size="md" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
                {story.userName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
