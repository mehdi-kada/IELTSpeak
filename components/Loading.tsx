import React from "react";
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A minimalist loading component with a sound wave animation.
 * @param {LoadingSpinnerProps} props - The component props.
 * @param {string} [props.message="Loading..."] - The message to display below the animation.
 * @param {boolean} [props.fullScreen=true] - Whether to take up the full screen.
 * @param {string} [props.size="md"] - Size of the loading animation.
 * @param {string} [props.className] - Additional CSS classes.
 */
function LoadingSpinner({
  message = "Loading...",
  fullScreen = true,
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 gap-1",
    md: "h-16 gap-2",
    lg: "h-24 gap-3",
  };

  const containerClasses = fullScreen
    ? `flex flex-col items-center justify-center min-h-screen bg-[#1F2937] text-white p-4 overflow-hidden ${className}`
    : `flex flex-col items-center justify-center p-4 ${className}`;

  const barWidth = {
    sm: "w-1",
    md: "w-2",
    lg: "w-3",
  };

  return (
    <div className={containerClasses}>
      {/* Minimalist Sound Wave Animation */}
      <div
        className={`sound-wave flex items-center justify-center ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <div
          className={`${barWidth[size]} h-full bg-[#E91E63] rounded-full`}
          style={{ animationDelay: "-0.5s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E91E63] rounded-full`}
          style={{ animationDelay: "-0.4s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E91E63] rounded-full`}
          style={{ animationDelay: "-0.3s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E91E63] rounded-full`}
          style={{ animationDelay: "-0.2s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E91E63] rounded-full`}
          style={{ animationDelay: "-0.1s" }}
        ></div>
      </div>

      {/* Loading Text */}
      {message && (
        <div className="text-center mt-8">
          <p className="text-lg font-medium text-gray-400">{message}</p>
        </div>
      )}

      {/* Animation styles */}
      <style jsx global>{`
        .sound-wave > div {
          animation: wave 1.2s infinite ease-in-out;
        }
        @keyframes wave {
          0%,
          40%,
          100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Skeleton loading component for content placeholders
 */
export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gray-200 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Loading button component
 */
export function LoadingButton({ 
  loading, 
  children, 
  disabled, 
  className = '',
  ...props 
}: {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        className
      )}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default LoadingSpinner;
export type { LoadingSpinnerProps };
