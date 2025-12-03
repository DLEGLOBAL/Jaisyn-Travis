
import React, { useState } from 'react';
import { Conversation, ChatMessage } from '../types';
import Chat from './Chat';
import { Search, MessageSquare } from 'lucide-react';

interface MessagesViewProps {
    myUsername: string;
}

const MessagesView: React.FC<MessagesViewProps> = ({ myUsername }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = (text: string) => {
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: myUsername,
          text,
          timestamp: Date.now()
      };
      setMessages([...messages, newMsg]);
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-900">
       {/* List Side */}
       <div className={`w-full md:w-80 border-r border-gray-700 flex flex-col bg-gray-900 ${selectedConvo ? 'hidden md:flex' : 'flex'}`}>
           <div className="p-4 border-b border-gray-700">
               <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
               <div className="relative">
                   <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                   <input className="w-full bg-gray-800 text-white pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-pink-500" placeholder="Search..." />
               </div>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar">
               {conversations.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                       <MessageSquare size={32} className="text-gray-700 mb-2" />
                       <p className="text-gray-500 text-sm">No messages yet.</p>
                       <p className="text-gray-600 text-xs mt-1">Chat with contestants after a match!</p>
                   </div>
               ) : (
                   conversations.map(convo => (
                   <div 
                     key={convo.id} 
                     onClick={() => setSelectedConvo(convo)}
                     className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors ${selectedConvo?.id === convo.id ? 'bg-gray-800 border-l-4 border-pink-500' : ''}`}
                   >
                       <img src={convo.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                       <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                               <h4 className="font-bold text-white text-sm truncate">{convo.username}</h4>
                               <span className="text-[10px] text-gray-500">Now</span>
                           </div>
                           <p className={`text-xs truncate ${convo.unread > 0 ? 'text-white font-bold' : 'text-gray-400'}`}>{convo.lastMessage}</p>
                       </div>
                       {convo.unread > 0 && (
                           <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                               {convo.unread}
                           </div>
                       )}
                   </div>
                   ))
               )}
           </div>
       </div>

       {/* Chat Area */}
       <div className={`flex-1 flex flex-col bg-black/20 ${!selectedConvo ? 'hidden md:flex' : 'flex'}`}>
           {selectedConvo ? (
               <>
                  <div className="p-4 border-b border-gray-700 flex items-center gap-3 bg-gray-800">
                      <button className="md:hidden text-gray-400" onClick={() => setSelectedConvo(null)}>←</button>
                      <img src={selectedConvo.avatarUrl} className="w-10 h-10 rounded-full" />
                      <div>
                          <h3 className="font-bold text-white">{selectedConvo.username}</h3>
                          <span className="text-[10px] text-green-400 flex items-center gap-1">● Online</span>
                      </div>
                  </div>
                  <div className="flex-1 overflow-hidden p-4">
                      <Chat messages={messages} onSendMessage={handleSendMessage} />
                  </div>
               </>
           ) : (
               <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
                   <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare size={32} className="text-gray-600" />
                   </div>
                   <p>Select a conversation to start chatting</p>
               </div>
           )}
       </div>
    </div>
  );
};

export default MessagesView;
