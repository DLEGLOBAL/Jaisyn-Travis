
import React, { useEffect, useRef, useState } from 'react';
import { Contestant, GameSettings, EntranceTheme } from '../types';
import { Hexagon, Triangle, Circle, Square, Wifi, Lock, UserCheck, Signal, SignalLow, SignalZero, Dog, Wind, ShoppingBag, User, Crown } from 'lucide-react';

interface VideoFeedProps {
  isLocal?: boolean;
  src?: string; 
  stream?: MediaStream;
  label: string;
  status: 'ACTIVE' | 'ELIMINATED';
  sentiment?: Contestant['sentiment'];
  isDoubleBlind?: boolean;
  settings?: GameSettings; 
  connectionQuality?: Contestant['connectionQuality'];
  isVerified?: boolean;
  
  hasPetCam?: boolean;
  isWearingPaperBag?: boolean;
  heliumVoice?: boolean;
  isUpsideDown?: boolean;
  
  // Subscription Theme
  entranceTheme?: EntranceTheme;
}

const SENTIMENT_COLORS = {
  HAPPY: 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]',
  NERVOUS: 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]',
  FLIRTY: 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]',
  ANGRY: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
};

const VideoFeed: React.FC<VideoFeedProps> = ({ 
  isLocal, src, stream, label, status, sentiment = 'FLIRTY', isDoubleBlind, settings, connectionQuality = 'GOOD', isVerified,
  hasPetCam, isWearingPaperBag, heliumVoice, entranceTheme
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      } else if (isLocal && status === 'ACTIVE' && !settings?.bandwidthSaver) {
        const startCamera = async () => {
            try {
              const constraints = { video: true, audio: true }; 
              const localStream = await navigator.mediaDevices.getUserMedia(constraints);
              if (videoRef.current) {
                videoRef.current.srcObject = localStream;
                setHasPermission(true);
              }
            } catch (err) {
              console.error("Error accessing camera:", err);
              setHasPermission(false);
            }
        };
        startCamera();
      }
    }
  }, [isLocal, status, stream, settings?.videoQuality, settings?.bandwidthSaver]);

  const isEliminated = status === 'ELIMINATED';
  let borderColorClass = isEliminated ? 'border-red-900' : (SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.FLIRTY);
  
  // Override border for premium themes
  if (!isEliminated && entranceTheme === 'GOLD_SPARKLE') borderColorClass = 'border-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.6)]';
  if (!isEliminated && entranceTheme === 'NEON_BLAST') borderColorClass = 'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.8)]';

  const blurClass = isDoubleBlind && status === 'ACTIVE' ? 'blur-xl scale-110' : '';
  const greenScreenClass = settings?.greenScreen ? 'brightness-110 contrast-110 sepia-[.3]' : '';
  const blurBgClass = settings?.blurBackground ? 'backdrop-blur-md' : '';

  const getSentimentIcon = () => {
    if (!settings?.colorBlindMode) return null;
    switch(sentiment) {
      case 'HAPPY': return <Circle size={20} className="text-yellow-400 fill-current" />;
      case 'NERVOUS': return <Triangle size={20} className="text-blue-400 fill-current" />;
      case 'FLIRTY': return <Hexagon size={20} className="text-pink-500 fill-current" />;
      case 'ANGRY': return <Square size={20} className="text-red-500 fill-current" />;
    }
  };

  const getConnectionIcon = () => {
    switch(connectionQuality) {
      case 'EXCELLENT': return <Signal size={14} className="text-green-500" />;
      case 'GOOD': return <Wifi size={14} className="text-yellow-500" />;
      case 'POOR': return <SignalLow size={14} className="text-red-500" />;
      default: return <SignalZero size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-xl bg-gray-900 border-2 transition-all duration-700 
      ${borderColorClass} 
      ${isEliminated ? 'grayscale brightness-50' : ''}`}>
      
      {/* Theme Badge */}
      {entranceTheme === 'GOLD_SPARKLE' && <div className="absolute top-0 right-0 p-2 z-20"><Crown size={16} className="text-yellow-400 fill-yellow-400 animate-pulse" /></div>}
      {entranceTheme === 'NEON_BLAST' && <div className="absolute top-0 right-0 p-2 z-20"><Crown size={16} className="text-purple-400 fill-purple-400 animate-pulse" /></div>}

      {hasPetCam && !isEliminated ? (
         <div className="w-full h-full flex flex-col items-center justify-center bg-orange-900/50">
             <img src={`https://placedog.net/400/400?id=${label.length}`} alt="Pet" className="w-full h-full object-cover" />
             <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                 <Dog size={12} /> PET CAM
             </div>
         </div>
      ) : (
        <>
            {settings?.bandwidthSaver && !isLocal ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                    <User size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-bold">VIDEO PAUSED</span>
                </div>
            ) : (
                <>
                {(hasPermission && !isEliminated) || (stream && !isEliminated) ? (
                    <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted={isLocal} 
                    className={`w-full h-full object-cover transition-all duration-1000 ${isLocal ? 'transform scale-x-[-1]' : ''} ${blurClass} ${greenScreenClass} ${blurBgClass}`} 
                    />
                ) : (
                    src ? (
                      <img 
                      src={src} 
                      alt={label} 
                      className={`w-full h-full object-cover transition-all duration-1000 ${blurClass}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                         <User size={48} className="text-gray-700" />
                      </div>
                    )
                )}
                </>
            )}
        </>
      )}
      
      {isWearingPaperBag && !isEliminated && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-800/90 z-20">
              <div className="text-center">
                  <ShoppingBag size={64} className="text-amber-200 mx-auto mb-2 opacity-80" />
                  <div className="text-amber-200 font-bold font-serif text-xl opacity-50">?</div>
              </div>
              <div className="absolute top-[40%] left-[35%] w-4 h-4 bg-black/50 rounded-full blur-sm"></div>
              <div className="absolute top-[40%] right-[35%] w-4 h-4 bg-black/50 rounded-full blur-sm"></div>
          </div>
      )}

      {!isEliminated && !isDoubleBlind && !isWearingPaperBag && (
        <div className={`absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-t from-current to-transparent ${sentiment === 'FLIRTY' ? 'text-pink-500' : 'text-transparent'}`}></div>
      )}

      {isEliminated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 animate-fade-in">
          <span className="text-4xl font-extrabold text-red-500 border-4 border-red-500 p-4 rounded-lg transform -rotate-12 uppercase tracking-widest animate-pop">
            POPPED
          </span>
        </div>
      )}
      
      {heliumVoice && !isEliminated && (
          <div className="absolute top-10 left-2 bg-blue-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 z-30 animate-bounce">
              <Wind size={10} /> HELIUM
          </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent z-20">
        <h3 className="text-white font-bold truncate text-shadow flex items-center gap-2">
          {label}
          {isVerified && <UserCheck size={14} className="text-blue-400" />} 
          {settings?.colorBlindMode ? getSentimentIcon() : (
            <>
            {sentiment === 'FLIRTY' && <span className="text-[10px] bg-pink-500 px-1 rounded text-white">🔥</span>}
            {sentiment === 'NERVOUS' && <span className="text-[10px] bg-blue-500 px-1 rounded text-white">💧</span>}
            </>
          )}
        </h3>
        <div className="flex items-center justify-between">
            {isLocal && <span className="text-xs text-pink-400 font-medium uppercase tracking-wider">You</span>}
            <div className="flex items-center gap-2 ml-auto">
                <span title="E2E Encrypted" className="flex items-center">
                    <Lock size={10} className="text-gray-400" />
                </span>
                {getConnectionIcon()}
            </div>
        </div>
      </div>

      <div className={`absolute top-3 right-3 w-4 h-4 rounded-full shadow-lg ${isEliminated ? 'bg-gray-600' : 'bg-green-500 animate-pulse'}`}></div>
      
      {isDoubleBlind && status === 'ACTIVE' && (
         <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-6xl">🙈</span>
         </div>
      )}
    </div>
  );
};

export default VideoFeed;
