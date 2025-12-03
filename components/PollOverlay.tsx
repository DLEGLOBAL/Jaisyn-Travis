import React from 'react';
import { Poll } from '../types';
import { BarChart2 } from 'lucide-react';

interface PollOverlayProps {
  poll: Poll | null;
}

const PollOverlay: React.FC<PollOverlayProps> = ({ poll }) => {
  if (!poll || !poll.isActive) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 md:top-24 z-[90] w-[90%] md:w-80 animate-bounce-in">
      <div className="bg-gray-900/95 backdrop-blur-md border-2 border-pink-500 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 size={16} className="text-pink-500" /> LIVE POLL
            </h3>
            <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white font-bold animate-pulse">VOTING OPEN</span>
        </div>
        
        <p className="text-md font-bold text-white mb-3 text-center leading-tight">{poll.question}</p>
        
        <div className="space-y-2">
            {poll.options.map((opt, idx) => {
                const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                return (
                    <div key={idx} className="relative h-8 bg-gray-800 rounded overflow-hidden group cursor-pointer hover:bg-gray-700 transition-colors">
                        <div 
                            className="absolute top-0 left-0 h-full bg-pink-600/50 transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold z-10">
                            <span className="text-white drop-shadow-md">{opt.label}</span>
                            <span className="text-pink-200 drop-shadow-md">{percentage}%</span>
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="mt-2 text-center text-[10px] text-gray-500">
            {poll.totalVotes.toLocaleString()} votes cast
        </div>
      </div>
    </div>
  );
};

export default PollOverlay;