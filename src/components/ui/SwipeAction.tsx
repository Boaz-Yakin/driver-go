'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SwipeActionProps {
  onAction: () => void;
  text: string;
  successText?: string;
}

export const SwipeAction: React.FC<SwipeActionProps> = ({ onAction, text, successText = 'Completed!' }) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const maxPosition = containerRef.current ? containerRef.current.offsetWidth - 64 : 200; // 64 is knob width

  const handleStart = (clientX: number) => {
    if (isSwiped) return;
    isDragging.current = true;
    startX.current = clientX - position;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || isSwiped) return;
    let newPos = clientX - startX.current;
    if (newPos < 0) newPos = 0;
    if (newPos > maxPosition) newPos = maxPosition;
    setPosition(newPos);
  };

  const handleEnd = () => {
    if (!isDragging.current || isSwiped) return;
    isDragging.current = false;
    
    if (position > maxPosition * 0.8) {
      setPosition(maxPosition);
      setIsSwiped(true);
      onAction();
    } else {
      setPosition(0);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => handleEnd();
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    
    if (isDragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-16 rounded-full overflow-hidden flex items-center justify-center transition-colors duration-300 ${isSwiped ? 'bg-[#22c55e]' : 'bg-[#1a1a1a]'}`}
    >
      <span className="text-sm font-medium z-0 select-none text-[#d4d4d4]">
        {isSwiped ? successText : text}
      </span>
      
      {!isSwiped && (
        <div 
          className="absolute left-1 h-14 w-14 rounded-full bg-[#3b82f6] shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
          style={{ transform: `translateX(${position}px)`, transition: isDragging.current ? 'none' : 'transform 0.3s ease' }}
          onMouseDown={(e) => handleStart(e.clientX)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        >
          <span className="text-white text-xl">→</span>
        </div>
      )}
    </div>
  );
};
