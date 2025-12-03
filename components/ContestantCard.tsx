
import React, { useState } from 'react';
import { Contestant, GameSettings } from '../types';
import VideoFeed from './VideoFeed';
import { XCircle, Heart, RefreshCw, HelpCircle, Gift, Shield, MoreVertical, Flag, Ban } from 'lucide-react';

interface ContestantCardProps {
  contestant: Contestant;
  onPop: (id: string) => void;
  onRevive: (id: string) => void;
  onSuperLike: (id: string) => void;
  onRevealMystery: (id: string) => void;
  onGift: (id: string) => void;
  isPicker: boolean; // Corresponds to !isSpectator
  isDoubleBlind: boolean;
  settings?: GameSettings;
}

const ContestantCard: React.FC<ContestantCardProps> = ({ 
  contestant, onPop, onRevive, onSuperLike, onRevealMystery, onGift, isPicker, isDoubleBlind, settings 
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && isPicker && contestant.status === 'ACTIVE' && !contestant.isImmune) {
       onPop(contestant.id);
    }
    if (isRightSwipe && isPicker && contestant.status === 'ACTIVE') {
       onSuperLike(contestant.id);
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div 
      className="relative group flex flex-col h-72 md:h-80 w-full transition-all duration-300 select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseLeave={() => setShowMenu(false)}
    >
      
      {contestant.status === 'ACTIVE' && !isDoubleBlind && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 bg-gray-900 border-2 border-pink-500 text-pink-400 text-xs font-black px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
          {contestant.compatibility}% MATCH
        </div>
      )}

      {contestant.isImmune && contestant.status === 'ACTIVE' && (
         <div className="absolute top-2 left-2 z-30 bg-blue-600 p-1.5 rounded-full shadow-lg animate-pulse" title="Immunity Active">
            <Shield size={16} className="text-white" />
         </div>
      )}

      <div className="absolute top-2 left-2 z-40">
          <button onClick={toggleMenu} className="p-1 bg-black/30 hover:bg-black/60 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical size={16} />
          </button>
          {showMenu && (
              <div className="absolute top-6 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[120px] z-50 animate-fade-in">
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"><Flag size={12} /> Report</button>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white hover:bg-gray-700 transition-colors"><Ban size={12} /> Block</button>
              </div>
          )}
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden shadow-2xl">
        <VideoFeed 
          isLocal={contestant.isLocal} 
          src={contestant.imageUrl} 
          stream={contestant.stream}
          label={`${contestant.name}, ${contestant.age}`}
          status={contestant.status}
          sentiment={contestant.sentiment}
          isDoubleBlind={isDoubleBlind}
          settings={settings}
          connectionQuality={contestant.connectionQuality}
          isVerified={contestant.isVerified}
          hasPetCam={contestant.hasPetCam}
          isWearingPaperBag={contestant.isWearingPaperBag}
          heliumVoice={contestant.heliumVoice}
        />
        
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-20 pointer-events-none">
           <p className="text-pink-300 font-bold mb-1">{contestant.job}</p>
           <p className="text-sm text-gray-300 italic mb-2">"{contestant.bio}"</p>
           {contestant.clubName && <span className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded mb-2">{contestant.clubName}</span>}
           {contestant.isMysteryRevealed ? (
             <div className="bg-purple-900/50 p-2 rounded border border-purple-500 mt-2">
                <p className="text-xs text-purple-200 font-bold uppercase">Secret Revealed:</p>
                <p className="text-xs text-white">{contestant.mysteryFact}</p>
             </div>
           ) : (
             <div className="flex items-center gap-1 text-xs text-gray-500 mt-2"><HelpCircle size={12} /> Mystery locked</div>
           )}
           {contestant.giftsReceived > 0 && <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1"><Gift size={12} /> {contestant.giftsReceived} Gifts</div>}
        </div>

        {contestant.superLikes > 0 && (
           <div className="absolute bottom-12 right-2 animate-bounce">
              <Heart className="text-pink-500 fill-pink-500 drop-shadow-lg" size={32} />
              <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{contestant.superLikes}</span>
           </div>
        )}
      </div>

      <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2 z-30 px-2 pointer-events-auto">
        
        {/* PICKER ACTIONS */}
        {isPicker && contestant.status === 'ACTIVE' && (
          <>
            <button
              onClick={() => onPop(contestant.id)}
              disabled={contestant.isImmune}
              className={`p-3 rounded-full shadow-lg border-4 border-gray-900 hover:scale-110 active:scale-95 transition-all text-white ${contestant.isImmune ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              title={contestant.isImmune ? "Immune!" : "POP Balloon"}
            >
              {contestant.isImmune ? <Shield size={24} /> : <XCircle size={24} />}
            </button>
            <button onClick={() => onSuperLike(contestant.id)} className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full shadow-lg border-4 border-gray-900 hover:scale-110 active:scale-95 transition-all" title="Super Like"><Heart size={24} className="fill-current" /></button>
          </>
        )}

        {isPicker && contestant.status === 'ELIMINATED' && (
           <button onClick={() => onRevive(contestant.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg border-4 border-gray-900 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm"><RefreshCw size={16} /> REVIVE</button>
        )}

        {/* SPECTATOR / UNIVERSAL ACTIONS (Gifting) */}
        {(!isPicker || contestant.status === 'ACTIVE') && (
            <button onClick={() => onGift(contestant.id)} className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg border-4 border-gray-900 hover:scale-110 active:scale-95 transition-all" title="Send Gift"><Gift size={24} /></button>
        )}
      </div>
    </div>
  );
};

export default ContestantCard;
