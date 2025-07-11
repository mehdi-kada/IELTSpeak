"use client";
import { NavigationProps } from '@/types/sessionTypes';
import React from 'react';
import MuteButton from './MuteSession';
import EndSessionButton from './EndSession';



export default function SessionNavigation({
  isMuted,
  callStatus,
  level,
  isSavingResults,
  onToggleMicrophone,
  onEndCall,
  vapiRef
}: NavigationProps) {
  return (
    <nav className="bg-[#2F2F7F] z-5 p-4 shadow-lg flex-shrink-0">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Mute Button */}
        <div className="flex items-center">
          <MuteButton
            isMuted={isMuted}
            callStatus={callStatus}
            onToggle={onToggleMicrophone}
            vapiRef={vapiRef}
          />
        </div>

        {/* Center: Session Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="font-semibold text-sm md:text-lg">
            IELTS Speaking {level}
          </span>
        </div>

        {/* Right: End Session Button */}
        <EndSessionButton
          isSavingResults={isSavingResults}
          onEndCall={onEndCall}
        />
      </div>
    </nav>
  );
}