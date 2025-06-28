import React from "react";

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
    ? `flex flex-col items-center justify-center min-h-screen bg-[#1a1a3a] text-white p-4 overflow-hidden ${className}`
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
      >
        <div
          className={`${barWidth[size]} h-full bg-[#E62136] rounded-full`}
          style={{ animationDelay: "-0.5s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E62136] rounded-full`}
          style={{ animationDelay: "-0.4s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E62136] rounded-full`}
          style={{ animationDelay: "-0.3s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E62136] rounded-full`}
          style={{ animationDelay: "-0.2s" }}
        ></div>
        <div
          className={`${barWidth[size]} h-full bg-[#E62136] rounded-full`}
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

export default LoadingSpinner;
export type { LoadingSpinnerProps };
