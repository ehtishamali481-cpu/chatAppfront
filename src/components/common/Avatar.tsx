import React, { useState } from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  hasStory?: boolean;
  className?: string;
  initials?: string;
  color?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: { box: 'w-7 h-7 text-[10px]', dot: 'w-2 h-2 bottom-0 right-0 border' },
  sm: { box: 'w-9 h-9 text-xs', dot: 'w-2.5 h-2.5 bottom-0 right-0 border-2' },
  md: { box: 'w-11 h-11 text-sm', dot: 'w-3 h-3 bottom-0 right-0 border-2' },
  lg: { box: 'w-14 h-14 text-base', dot: 'w-3.5 h-3.5 bottom-0.5 right-0.5 border-2' },
  xl: { box: 'w-24 h-24 text-2xl', dot: 'w-5 h-5 bottom-1 right-1 border-4' },
};

const getGradient = (name: string): string => {
  const gradients = [
    'from-emerald-600 to-teal-800',
    'from-teal-600 to-emerald-700',
    'from-cyan-600 to-teal-800',
    'from-slate-700 to-zinc-900',
    'from-indigo-600 to-emerald-800',
    'from-amber-600 to-emerald-900',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  online,
  hasStory = false,
  className = '',
  initials: customInitials,
  color,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const initials =
    customInitials ||
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    '?';

  const { box, dot } = sizeMap[size];
  const gradient = color ? `bg-gradient-to-tr ${color}` : `bg-gradient-to-tr ${getGradient(name)}`;

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 ${onClick ? 'cursor-pointer hover:opacity-95' : ''} ${className}`}
    >
      <div
        className={`${box} rounded-full flex items-center justify-center font-semibold text-white shadow-sm overflow-hidden select-none ${
          hasStory ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
        } ${gradient}`}
      >
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="tracking-tight">{initials}</span>
        )}
      </div>

      {Boolean(online) && (
        <span
          className={`absolute rounded-full border-white dark:border-slate-900 transition-colors ${dot} bg-emerald-500`}
          title="Online"
        />
      )}
    </div>
  );
};
