import React from 'react';

interface PulseLogoProps {
  className?: string;
  size?: number;
}

export const PulseLogo: React.FC<PulseLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 shadow-md shadow-emerald-900/20 text-white shrink-0 ${className}`}
    >
      <svg
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white drop-shadow-sm"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.54 20.8a1 1 0 001.218 1.218l3.632-.898A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-1 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4.5 7.5h-7a1 1 0 010-2h7a1 1 0 010 2z" />
      </svg>
      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300 border-2 border-white dark:border-slate-900"></span>
      </span>
    </div>
  );
};

export const ChatlyLogo = PulseLogo;

