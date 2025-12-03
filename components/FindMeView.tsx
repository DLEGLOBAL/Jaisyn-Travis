
import React, { useState, useEffect } from 'react';
import { X, Heart, RefreshCw, Info, MapPin, Briefcase, Search } from 'lucide-react';
import { User } from '../types';
import ChromaKeyEffect from './ChromaKeyEffect';

interface FindMeViewProps {
  user: User;
}

const FindMeView: React.FC<FindMeViewProps> = ({ user }) => {
  const [profiles, setProfiles] = useState<any[]>([]); // Initialize empty
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [showPopEffect, setShowPopEffect] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate Fetching Profiles (Production Ready: Connect to API here)
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
        setLoading(false);
        // setProfiles([]); // Explicitly empty for now
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    setLastDirection(direction);
    
    if (direction === 'left') {
        setShowPopEffect(true);
    }

    setTimeout(() => {
        setLastDirection(null);
        setCurrentIndex(prev => prev + 1);
    }, 300); // Wait for animation
  };

  const reset = () => {
      setCurrentIndex(0);
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
      return (
          <div className="flex-1 h-full bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
              <Search className="text-pink-500 animate-bounce mb-4" size={48} />
              <h2 className="text-xl font-bold text-white mb-2">Searching Nearby...</h2>
              <p className="text-gray-500 text-sm">Finding people in your area.</p>
          </div>
      );
  }

  if (!currentProfile) {
      return (
          <div className="flex-1 h-full bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw size={32} className="text-gray-600" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">No Profiles Found</h2>
              <p className="text-gray-500 mb-6">Check back later for more people.</p>
              <button onClick={reset} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-bold">
                  Refresh
              </button>
          </div>
      );
  }

  return (
    <div className="flex-1 h-full bg-gray-900 overflow-hidden relative flex flex-col items-center justify-center p-4">
        
        <ChromaKeyEffect 
           src="https://iepmdfvilmhuasszfyrs.supabase.co/storage/v1/object/public/Love%20Pop/poplove.mp4" 
           isActive={showPopEffect} 
           onComplete={() => setShowPopEffect(false)}
        />

        <div className="absolute top-4 bg-gray-800 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="font-black italic text-white">FIND<span className="text-pink-500">ME</span></span>
        </div>

        {/* Card Stack */}
        <div className="relative w-full max-w-sm aspect-[3/4]">
            
            {/* Background Card (Next Profile) */}
            {profiles[currentIndex + 1] && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-800 rounded-3xl transform scale-95 translate-y-4 opacity-50">
                     <img src={profiles[currentIndex + 1].img} className="w-full h-full object-cover rounded-3xl" />
                </div>
            )}

            {/* Active Card */}
            <div className={`absolute top-0 left-0 w-full h-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${lastDirection === 'left' ? '-translate-x-[150%] rotate-[-20deg]' : ''} ${lastDirection === 'right' ? 'translate-x-[150%] rotate-[20deg]' : ''}`}>
                <img src={currentProfile.img} className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6">
                    <h2 className="text-3xl font-black text-white flex items-end gap-2">
                        {currentProfile.name} <span className="text-xl font-normal text-gray-300">{currentProfile.age}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-gray-300 text-sm mt-1 mb-2">
                        <Briefcase size={14} /> {currentProfile.job}
                    </div>
                    <p className="text-gray-200">{currentProfile.bio}</p>
                </div>

                {/* Info Icon */}
                <button className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white backdrop-blur hover:bg-black/50">
                    <Info size={20} />
                </button>
            </div>

            {/* Swipe Indicators (Visual Feedback) */}
            {lastDirection === 'right' && (
                <div className="absolute top-10 left-10 border-4 border-green-500 text-green-500 font-black text-4xl px-4 py-2 rounded transform -rotate-12 z-50">
                    LOVE
                </div>
            )}
            {lastDirection === 'left' && (
                <div className="absolute top-10 right-10 border-4 border-red-500 text-red-500 font-black text-4xl px-4 py-2 rounded transform rotate-12 z-50">
                    POP
                </div>
            )}

        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
            <button 
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-red-500 shadow-lg border border-gray-700 hover:scale-110 hover:bg-red-500 hover:text-white transition-all"
            >
                <X size={32} />
            </button>
            
            <button className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-blue-400 shadow-lg border border-gray-700 hover:scale-110 hover:bg-blue-500 hover:text-white transition-all">
                <RefreshCw size={20} />
            </button>

            <button 
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-green-500 shadow-lg border border-gray-700 hover:scale-110 hover:bg-green-500 hover:text-white transition-all"
            >
                <Heart size={32} fill="currentColor" />
            </button>
        </div>

    </div>
  );
};

export default FindMeView;
