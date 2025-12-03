import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
        <MessageCircle size={16} className="text-pink-500" />
        <span className="font-bold text-sm">Live Chat</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center my-2' : 'items-start'}`}>
            {msg.isSystem ? (
              <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded-full uppercase tracking-wider">
                {msg.text}
              </span>
            ) : (
              <div className="max-w-[85%]">
                <span className="text-[10px] text-pink-400 font-bold block mb-0.5">{msg.sender}</span>
                <div className="bg-gray-800 p-2 rounded-r-lg rounded-bl-lg text-xs text-white">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-gray-700 bg-gray-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Say something nice..."
          className="flex-1 bg-gray-900 text-white text-xs p-2 rounded border border-gray-700 focus:border-pink-500 outline-none"
        />
        <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default Chat;