
import React from 'react';
import { ShoppingBag, Shield, X, Skull, Zap, Crown, Gem, CreditCard, Check } from 'lucide-react';
import { Contestant } from '../types';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  contestants: Contestant[];
  onPurchase: (item: string, targetId?: string) => void;
}

const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose, credits, contestants, onPurchase }) => {
  if (!isOpen) return null;

  const activeContestants = contestants.filter(c => c.status === 'ACTIVE');

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
      <div className="bg-gray-900 rounded-none md:rounded-2xl w-full h-full md:h-auto md:max-h-[85vh] max-w-2xl border border-yellow-500/30 shadow-2xl overflow-hidden animate-zoom-in flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 text-white">
              <ShoppingBag className="text-yellow-400" /> Item Shop
            </h2>
            <p className="text-gray-400 text-xs md:text-sm">Spend your credits to create chaos.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-yellow-500/50 flex items-center gap-2">
                <Gem size={14} className="text-yellow-400" />
                <span className="font-mono font-bold text-yellow-400 text-sm">{credits} CR</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2">
                <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
            
            {/* Item 1: Immunity */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition-all group">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Shield size={24} />
                    </div>
                    <span className="font-mono font-bold text-white">500 CR</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Immunity Idol</h3>
                <p className="text-xs text-gray-400 mb-4">Protect a contestant from being popped for 1 round.</p>
                <div className="grid grid-cols-3 gap-1">
                    {activeContestants.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => onPurchase('IMMUNITY', c.id)}
                            className="text-[10px] bg-gray-700 hover:bg-blue-600 px-2 py-1 rounded truncate transition-colors"
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Item 2: Paid Pop */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-red-500 transition-all group">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-3 bg-red-500/20 rounded-lg text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <Skull size={24} />
                    </div>
                    <span className="font-mono font-bold text-white">1000 CR</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Paid Pop (Chaos)</h3>
                <p className="text-xs text-gray-400 mb-4">Force the picker to pop a specific balloon immediately.</p>
                <div className="grid grid-cols-3 gap-1">
                    {activeContestants.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => onPurchase('PAID_POP', c.id)}
                            className="text-[10px] bg-gray-700 hover:bg-red-600 px-2 py-1 rounded truncate transition-colors"
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Item 3: Profile Boost */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-purple-500 transition-all group">
                 <div className="flex justify-between items-start mb-2">
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <Zap size={24} />
                    </div>
                    <span className="font-mono font-bold text-white">200 CR</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Profile Boost</h3>
                <p className="text-xs text-gray-400 mb-3">Get to the top of the queue for the next game.</p>
                <button onClick={() => onPurchase('BOOST')} className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-bold text-sm">
                    Boost Me
                </button>
            </div>

             {/* Item 4: LovePop Gold */}
             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 bg-yellow-500 w-16 h-16 blur-xl opacity-20"></div>
                 <div className="flex justify-between items-start mb-2">
                    <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                        <Crown size={24} />
                    </div>
                    <span className="font-mono font-bold text-white">$4.99</span>
                </div>
                <h3 className="font-bold text-lg mb-1">LovePop Gold</h3>
                <p className="text-xs text-gray-400 mb-3">Remove ads, advanced AI stats, and 4K streaming.</p>
                <button onClick={() => onPurchase('SUB')} className="w-full btn-brand py-2 rounded-lg font-bold text-sm shadow-lg">
                    Subscribe
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default StoreModal;
