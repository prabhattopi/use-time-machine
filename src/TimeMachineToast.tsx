// src/TimeMachineToast.tsx

import React from 'react';

export interface TimeMachineToastProps {
  /** True while the time machine countdown is running */
  isPending: boolean;
  /** The remaining time in milliseconds (from the useTimeMachine hook) */
  timeLeft: number;
  /** The total duration of the delay (used to calculate the progress bar width) */
  totalDelayMs?: number;
  /** The undo function (from the useTimeMachine hook) */
  undo: () => void;
  /** The text displayed to the user */
  message?: string;
  /** The text for the undo button */
  actionText?: string;
  /** Allows overriding styles with Tailwind or CSS Modules */
  className?: string;
  /** Allows overriding with inline styles */
  style?: React.CSSProperties;
}

export const TimeMachineToast: React.FC<TimeMachineToastProps> = ({
  isPending,
  timeLeft,
  totalDelayMs = 5000,
  undo,
  message = "Action completed.",
  actionText = "Undo",
  className,
  style,
}) => {
  // If no action is pending, don't render the toast
  if (!isPending) return null;

  // Calculate the percentage for the shrinking progress bar
  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / totalDelayMs) * 100));

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#1f2937', // Modern dark gray
        color: '#f9fafb',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '300px',
        zIndex: 9999,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
        <button
          onClick={undo}
          style={{
            backgroundColor: 'transparent',
            color: '#60a5fa', // Brand blue
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {actionText}
        </button>
      </div>

      {/* Progress Bar Track */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#374151',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        {/* Shrinking Progress Bar Fill */}
        <div
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            backgroundColor: '#60a5fa',
            transition: 'width 100ms linear', // Matches our setInterval speed for buttery smoothness
          }}
        />
      </div>
    </div>
  );
};