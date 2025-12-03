
import React, { useEffect } from 'react';
import ChromaKeyEffect from './ChromaKeyEffect';

interface TransitionScreenProps {
  onAnimationEnd: () => void;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ onAnimationEnd }) => {
  
  // Safety timeout to ensure user never gets stuck on black screen
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      onAnimationEnd();
    }, 5000); 
    return () => clearTimeout(safetyTimer);
  }, [onAnimationEnd]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black">
       <ChromaKeyEffect 
          src="https://iepmdfvilmhuasszfyrs.supabase.co/storage/v1/object/public/Love%20Pop/poplove.mp4"
          isActive={true}
          onComplete={onAnimationEnd}
          className="w-full h-full object-cover"
       />
    </div>
  );
};

export default TransitionScreen;
