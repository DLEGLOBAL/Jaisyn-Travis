
import React from 'react';
import { Mic, Zap, ThumbsDown, PartyPopper, Bell } from 'lucide-react';

export const SFX = {
  cricket: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3', // Placeholder
  airhorn: 'https://www.myinstants.com/media/sounds/air-horn-club-sample_1.mp3',
  gasp: 'https://www.myinstants.com/media/sounds/shocked-sound-effect.mp3',
  drumroll: 'https://www.myinstants.com/media/sounds/drum-roll-sound-effect.mp3',
  join: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' // Subtle chime
};

const Soundboard: React.FC = () => {
  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play error", e));
  };

  return (
    <div className="flex gap-2 p-2 bg-gray-800 rounded-xl overflow-x-auto custom-scrollbar">
      <button onClick={() => playSound(SFX.join)} className="flex flex-col items-center justify-center p-2 min-w-[60px] bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 transition-colors">
        <Bell size={16} />
        <span className="text-[10px] font-bold mt-1">CHIME</span>
      </button>
      <button onClick={() => playSound(SFX.airhorn)} className="flex flex-col items-center justify-center p-2 min-w-[60px] bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors">
        <Zap size={16} />
        <span className="text-[10px] font-bold mt-1">HORN</span>
      </button>
      <button onClick={() => playSound(SFX.gasp)} className="flex flex-col items-center justify-center p-2 min-w-[60px] bg-yellow-500/20 hover:bg-yellow-500/40 rounded-lg text-yellow-400 transition-colors">
        <Mic size={16} />
        <span className="text-[10px] font-bold mt-1">GASP</span>
      </button>
      <button onClick={() => playSound(SFX.cricket)} className="flex flex-col items-center justify-center p-2 min-w-[60px] bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-400 transition-colors">
        <ThumbsDown size={16} />
        <span className="text-[10px] font-bold mt-1">AWKWARD</span>
      </button>
      <button onClick={() => playSound(SFX.drumroll)} className="flex flex-col items-center justify-center p-2 min-w-[60px] bg-purple-500/20 hover:bg-purple-500/40 rounded-lg text-purple-400 transition-colors">
        <PartyPopper size={16} />
        <span className="text-[10px] font-bold mt-1">DRUM</span>
      </button>
    </div>
  );
};

export default Soundboard;
