
import React, { useState } from 'react';
import { Wind, RotateCw, Dog, Mic2, HelpCircle, ShoppingBag, Music, Clock } from 'lucide-react';

interface ChaosMenuProps {
  onTrigger: (effect: string) => void;
  credits: number;
}

const ChaosMenu: React.FC<ChaosMenuProps> = ({ onTrigger, credits }) => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  const handleTrigger = (effect: string, cost: number) => {
    if (credits >= cost) {
      onTrigger(effect);
      setActiveEffect(effect);
      setTimeout(() => setActiveEffect(null), 1000); // Visual feedback reset
    } else {
      alert("Not enough credits for Chaos!");
    }
  };

  const EFFECTS = [
    { id: 'HELIUM', label: 'Helium Voice', icon: <Wind size={18} />, cost: 50, color: 'text-blue-400', desc: 'Squeaky voices for everyone' },
    { id: 'UPSIDE_DOWN', label: 'Upside Down', icon: <RotateCw size={18} />, cost: 100, color: 'text-yellow-400', desc: 'Flip the picker screen' },
    { id: 'PET_CAM', label: 'Pet Cam', icon: <Dog size={18} />, cost: 25, color: 'text-orange-400', desc: 'Show pets only' },
    { id: 'KARAOKE', label: 'Karaoke', icon: <Mic2 size={18} />, cost: 75, color: 'text-pink-400', desc: 'Force a singing round' },
    { id: 'BLIND_DATE', label: 'Blind Date', icon: <ShoppingBag size={18} />, cost: 150, color: 'text-gray-400', desc: 'Paper bags for all' },
    { id: 'TRUTH_DARE', label: 'Truth or Dare', icon: <HelpCircle size={18} />, cost: 0, color: 'text-green-400', desc: 'Spin the wheel' },
    { id: 'TALENT', label: 'Talent Show', icon: <Music size={18} />, cost: 0, color: 'text-purple-400', desc: '10s Talent Timer' },
    { id: 'OUTFIT', label: 'Outfit Change', icon: <Clock size={18} />, cost: 0, color: 'text-red-400', desc: '30s Change Timer' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mt-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
        <span className="animate-pulse">⚡</span> Chaos Mode
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {EFFECTS.map((effect) => (
          <button
            key={effect.id}
            onClick={() => handleTrigger(effect.id, effect.cost)}
            className={`p-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-pink-500 transition-all flex flex-col items-center gap-1 group ${activeEffect === effect.id ? 'ring-2 ring-pink-500 bg-pink-500/10' : ''}`}
            title={effect.desc}
          >
            <div className={`${effect.color} group-hover:scale-110 transition-transform`}>
              {effect.icon}
            </div>
            <span className="text-[10px] font-bold text-gray-300">{effect.label}</span>
            {effect.cost > 0 && <span className="text-[9px] text-gray-500">{effect.cost} CR</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChaosMenu;
