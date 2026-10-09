import React, { useState, useEffect, useRef } from 'react';
import { BsPlayFill, BsPauseFill } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import { Avatar } from '../common/Avatar';

interface AudioPlayerProps {
  duration?: number;
  waveform?: number[];
  senderName?: string;
  senderAvatar?: string;
  accentColor?: string;
}

const DEFAULT_WAVEFORM = [
  25, 40, 60, 85, 100, 75, 45, 60, 90, 85, 70, 55, 40, 65, 85, 95, 75, 50, 30, 20, 35, 50, 70, 85, 60, 45, 30, 45, 60, 80,
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  duration = 38,
  waveform = DEFAULT_WAVEFORM,
  senderName = 'Elena Rostova',
  senderAvatar,
  accentColor = '#006948',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(14);
  const [playbackRate, setPlaybackRate] = useState<number>(1.5);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(duration, prev + 1);
        });
      }, 1000 / playbackRate);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackRate, duration]);

  const togglePlay = (): void => {
    setIsPlaying((prev) => !prev);
  };

  const cycleSpeed = (): void => {
    const speeds = [1.0, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  const handleScrub = (index: number): void => {
    const fraction = index / waveform.length;
    const newTime = Math.round(fraction * duration);
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = currentTime / duration;
  const activeBarsCount = Math.floor(progress * waveform.length);

  return (
    <div className="flex items-center gap-3 py-1 px-1 max-w-md select-none">

      <button
        type="button"
        onClick={togglePlay}
        className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-md transition-transform active:scale-95 hover:opacity-90"
        style={{ backgroundColor: accentColor }}
        aria-label={isPlaying ? 'Pause audio note' : 'Play audio note'}
      >
        {isPlaying ? (
          <BsPauseFill className="text-2xl" />
        ) : (
          <BsPlayFill className="text-2xl ml-0.5" />
        )}
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-0.5 sm:gap-1 h-8 cursor-pointer group py-1">
          {waveform.map((amp, idx) => {
            const isBarActive = idx <= activeBarsCount;
            const barHeight = Math.max(15, Math.min(100, amp));
            return (
              <div
                key={idx}
                onClick={() => handleScrub(idx)}
                className="flex-1 h-full flex items-center justify-center py-0.5"
                title={`Seek to ${formatTime((idx / waveform.length) * duration)}`}
              >
                <div
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: isBarActive ? accentColor : undefined,
                  }}
                  className={`w-full max-w-[3.5px] rounded-full transition-all duration-150 ${isBarActive
                      ? 'shadow-sm'
                      : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500'
                    }`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleSpeed}
              className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {playbackRate}x
            </button>

            {senderName && (
              <div className="flex items-center gap-1">
                <Avatar name={senderName} avatarUrl={senderAvatar} size="xs" />
                <FiDownload className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
