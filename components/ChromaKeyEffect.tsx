
import React, { useRef, useEffect } from 'react';

interface ChromaKeyEffectProps {
  src: string; 
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}

const ChromaKeyEffect: React.FC<ChromaKeyEffectProps> = ({ 
  src, 
  isActive, 
  onComplete,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // When activated, reset and play
      video.currentTime = 0;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Autoplay prevented or interrupted:", e.message || "Unknown error");
        });
      }
    } else {
       // Optional: Pause when not active to save resources
       // video.pause(); 
    }
  }, [isActive]);

  const handleEnded = () => {
    if (isActive && onComplete) {
      onComplete();
    }
  };

  const handleError = () => {
    // Sanitize: Do not log the 'e' event object directly as it contains circular references to the DOM
    console.warn(`Video playback failed for source: ${src}`);
    
    // If error occurs during active transition, force complete to avoid getting stuck
    if (isActive && onComplete) onComplete();
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-full z-[999999] video-overlay bg-black/40 ${isActive ? 'video-visible' : 'video-hidden'} ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        onEnded={handleEnded}
        onError={handleError}
        playsInline
        muted
        preload="auto" 
      />
    </div>
  );
};

export default ChromaKeyEffect;
