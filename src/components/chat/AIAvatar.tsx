/**
 * AIAvatar — Phase 15: AI Identity Component
 *
 * A small, presentational teal avatar for HealthWise AI.
 * Shows a pulsing ring animation when the AI is actively thinking.
 */
import React from 'react';
import { Bot } from 'lucide-react';

interface AIAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isThinking?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-7 h-7', icon: 'w-3.5 h-3.5' },
  md: { container: 'w-9 h-9', icon: 'w-4.5 h-4.5' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
};

export const AIAvatar: React.FC<AIAvatarProps> = ({
  size = 'sm',
  isThinking = false,
  className = '',
}) => {
  const sc = sizeClasses[size];

  return (
    <div className={`relative flex-shrink-0 ${className}`} aria-hidden="true">
      {/* Pulsing ring when thinking */}
      {isThinking && (
        <span
          className={`absolute inset-0 rounded-xl bg-teal-400/30 animate-ping`}
          aria-hidden="true"
        />
      )}
      <div
        className={`${sc.container} rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm relative`}
      >
        <Bot className={sc.icon} />
      </div>
    </div>
  );
};
