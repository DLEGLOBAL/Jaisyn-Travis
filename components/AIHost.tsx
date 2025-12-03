
import React, { useState } from 'react';
import { Sparkles, MessageSquare, Flame, Snowflake, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { getAICommentary, AIMode } from '../services/geminiService';
import { Contestant } from '../types';

interface AIHostProps {
  contestants: Contestant[];
}

const AIHost: React.FC<AIHostProps> = ({ contestants }) => {
  const [commentary, setCommentary] = useState<string>("Welcome to LovePop! I'm CupidBot. Let the chaos begin!");
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const triggerAI = async (mode: AIMode) => {
    setIsLoading(true);
    const text = await getAICommentary(contestants, mode);
    setCommentary(text);
    setIsLoading(false);
  };

  return (
    // Fixed PC visibility by increasing z-index to z-[60] and adjusting position relative to viewport
    <div className={`fixed bottom-24 right-4 md:bottom-6 md:left-6 md:right-auto z-[60] w-full max-w-[320px] transition-all duration-300 ${isCollapsed ? 'translate-y-[calc(100%-60px)]' : ''}`}>
      <div className="glass-panel rounded-2xl p-4 shadow-2xl border-t-4 border-pink-500 relative bg-gray-900/80 backdrop-blur-xl">
        
        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1 rounded-full border border-gray-700 shadow-lg z-10"
        >
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Avatar */}
        <div className="absolute -top-8 -left-2 bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-full shadow-lg border-4 border-gray-900 group cursor-pointer hover:scale-110 transition-transform" onClick={() => triggerAI('INTRO')}>
           <Sparkles className="text-white w-8 h-8 animate-spin-slow" />
        </div>

        <div className="ml-10 flex justify-between items-center mb-2 h-8">
            <h3 className="text-pink-400 font-bold uppercase text-xs tracking-widest">CupidBot AI</h3>
            <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">ONLINE</span>
        </div>
        
        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="animate-fade-in">
            {/* Text Output */}
            <div className="min-h-[60px] max-h-[100px] overflow-y-auto custom-scrollbar mb-3 bg-black/20 p-2 rounded-lg">
                <p className="text-sm text-white leading-relaxed font-medium">
                  {isLoading ? (
                    <span className="animate-pulse text-pink-300">Scanning vibes... Calculating roast...</span>
                  ) : (
                    `"${commentary}"`
                  )}
                </p>
            </div>

            {/* Mode Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => triggerAI('ROAST')}
                className="bg-red-500/10 hover:bg-red-500/30 text-red-400 text-[10px] font-bold py-2 rounded-lg transition-colors flex flex-col items-center gap-1"
              >
                <Flame size={14} /> ROAST
              </button>
              
              <button 
                onClick={() => triggerAI('ADVICE')}
                className="bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 text-[10px] font-bold py-2 rounded-lg transition-colors flex flex-col items-center gap-1"
              >
                <MessageSquare size={14} /> ADVICE
              </button>

              <button 
                onClick={() => triggerAI('WINGMAN')}
                className="bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 text-[10px] font-bold py-2 rounded-lg transition-colors flex flex-col items-center gap-1"
              >
                <UserCheck size={14} /> WINGMAN
              </button>
            </div>
            
            {/* Additional Mini-feature: Icebreaker */}
            <button 
                onClick={() => triggerAI('ICEBREAKER')}
                className="mt-2 w-full text-[10px] text-gray-400 hover:text-white flex items-center justify-center gap-1 py-1"
            >
                <Snowflake size={10} /> Need an icebreaker?
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIHost;
