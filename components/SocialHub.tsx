
import React, { useState } from 'react';
import { Users, Trophy, MessageSquare, Star, UserPlus } from 'lucide-react';
import Chat from './Chat';
import { ChatMessage, LeaderboardEntry } from '../types';

interface SocialHubProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const SocialHub: React.FC<SocialHubProps> = ({ isOpen, onClose, messages, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'CLUBS' | 'RANKS'>('CHAT');

  if (!isOpen) return null;

  return (
    <div className={`fixed right-0 top-0 bottom-0 w-full md:w-80 bg-gray-900 border-l border-gray-700 z-[80] shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Users className="text-pink-500" size={20} /> Social Hub
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 ${activeTab === 'CHAT' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <MessageSquare size={14} /> CHAT
        </button>
        <button 
          onClick={() => setActiveTab('CLUBS')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 ${activeTab === 'CLUBS' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Star size={14} /> CLUBS
        </button>
        <button 
          onClick={() => setActiveTab('RANKS')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 ${activeTab === 'RANKS' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Trophy size={14} /> RANKS
        </button>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-110px)] overflow-hidden">
        
        {activeTab === 'CHAT' && (
          <Chat messages={messages} onSendMessage={onSendMessage} />
        )}

        {activeTab === 'CLUBS' && (
          <div className="p-4 space-y-3 overflow-y-auto h-full custom-scrollbar flex flex-col items-center justify-center text-center">
            <Star size={48} className="text-gray-700 mb-2" />
            <h3 className="text-sm font-bold text-white">No Clubs Active</h3>
            <p className="text-xs text-gray-500">Clubs will appear here once created.</p>
            <div className="mt-4 p-4 bg-pink-900/20 border border-pink-900 rounded-xl w-full">
               <p className="text-xs text-pink-300">Join a club to get exclusive badges and flair!</p>
            </div>
          </div>
        )}

        {activeTab === 'RANKS' && (
          <div className="p-4 space-y-2 overflow-y-auto h-full custom-scrollbar flex flex-col items-center justify-center text-center">
             <Trophy size={48} className="text-gray-700 mb-2" />
             <h3 className="text-sm font-bold text-white">Season 1</h3>
             <p className="text-xs text-gray-500">Leaderboards reset weekly.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SocialHub;
