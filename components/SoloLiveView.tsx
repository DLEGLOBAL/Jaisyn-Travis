
import React, { useEffect, useRef, useState } from 'react';
import VideoFeed from './VideoFeed';
import Chat from './Chat';
import { ChatMessage, User } from '../types';
import { User as UserIcon, Heart, Share2, Monitor, Camera, Mic, MicOff, Video, VideoOff, Lock, Square } from 'lucide-react';

interface SoloLiveViewProps {
  user: User;
}

const SoloLiveView: React.FC<SoloLiveViewProps> = ({ user }) => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Setup State
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [streamTitle, setStreamTitle] = useState(`${user.username}'s Stream`);
  const [isPublic, setIsPublic] = useState(true);
  const [streamPassword, setStreamPassword] = useState('');

  // Device State
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    // Initial Camera Load
    startCamera();
    return () => {
        stopTracks();
    };
  }, []);

  const stopTracks = () => {
      stream?.getTracks().forEach(t => t.stop());
  };

  const startCamera = async () => {
      try {
          stopTracks();
          const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setStream(s);
          setIsScreenSharing(false);
      } catch (e) {
          console.error("Camera error", e);
      }
  };

  const toggleScreenShare = async () => {
      if (isScreenSharing) {
          // Switch back to Camera
          await startCamera();
      } else {
          try {
              const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
              
              // Handle user stopping share via browser UI
              displayStream.getVideoTracks()[0].onended = () => {
                  startCamera();
              };

              stopTracks();
              setStream(displayStream);
              setIsScreenSharing(true);
          } catch (e) {
              console.error("Screen share cancelled", e);
          }
      }
  };

  const toggleMute = () => {
      if (stream) {
          stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
          setIsMuted(!isMuted);
      }
  };

  const toggleVideo = () => {
      if (stream) {
          stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
          setIsVideoOff(!isVideoOff);
      }
  };

  const handleSendMessage = (text: string) => {
      setMessages([...messages, { id: Date.now().toString(), sender: user.username, text, timestamp: Date.now() }]);
  };

  const handleGoLive = () => {
      console.log(`Starting Stream: ${streamTitle} | Public: ${isPublic} | Password: ${isPublic ? 'N/A' : (streamPassword || 'None')}`);
      setIsSetupMode(false);
      // Simulate viewers joining
      setInterval(() => {
          setViewers(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);
  };

  const handleEndStream = () => {
      stopTracks();
      setViewers(0);
      setLikes(0);
      setMessages([]);
      setIsSetupMode(true);
      setIsScreenSharing(false);
      startCamera(); // Restart preview
  };

  if (isSetupMode) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-gray-900 p-6">
              <div className="w-full max-w-2xl bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                  <h2 className="text-3xl font-black italic text-white mb-6">STREAM SETUP</h2>
                  
                  <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden relative border border-gray-700">
                      {stream ? (
                          <VideoFeed isLocal={true} stream={stream} label="Preview" status="ACTIVE" />
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">Loading Preview...</div>
                      )}
                      
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                          <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700/80 hover:bg-gray-600'} text-white backdrop-blur`}>
                              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                          </button>
                          <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-700/80 hover:bg-gray-600'} text-white backdrop-blur`}>
                              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                          </button>
                          <button onClick={toggleScreenShare} className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700/80 hover:bg-gray-600'} text-white backdrop-blur`}>
                              <Monitor size={20} />
                          </button>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Stream Title</label>
                          <input 
                              value={streamTitle} 
                              onChange={(e) => setStreamTitle(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none"
                              placeholder="What are you doing today?"
                          />
                      </div>
                      
                      <div className="flex items-center justify-between bg-gray-900 p-3 rounded-xl border border-gray-600">
                          <span className="text-sm font-bold text-gray-300">Public Stream</span>
                          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-pink-500"/>
                      </div>

                      {!isPublic && (
                           <div className="animate-fade-in-up">
                              <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Lock size={12}/> Access Password</label>
                              <input 
                                  type="password"
                                  value={streamPassword} 
                                  onChange={(e) => setStreamPassword(e.target.value)}
                                  className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none"
                                  placeholder="Leave empty for invite link only"
                              />
                          </div>
                      )}

                      <button onClick={handleGoLive} className="w-full py-4 btn-brand rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all">
                          <Radio size={20} /> GO LIVE NOW
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-black overflow-hidden">
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
            {stream ? (
                <div className="w-full h-full max-w-6xl aspect-video bg-black relative">
                     <VideoFeed 
                        isLocal={true} 
                        stream={stream} 
                        label={user.username} 
                        status="ACTIVE" 
                     />
                     
                     {/* Overlay Stats */}
                     <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black animate-pulse flex items-center gap-1 shadow-lg">
                            <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                        </div>
                        <div className="bg-black/60 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/10">
                            <UserIcon size={12} /> {viewers}
                        </div>
                     </div>

                     {/* Stream Controls Overlay (On Hover or Always visible) */}
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-black/50 backdrop-blur rounded-2xl border border-white/10 opacity-0 hover:opacity-100 transition-opacity">
                          <button onClick={toggleMute} className={`p-3 rounded-xl ${isMuted ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-white/20'}`} title={isMuted ? "Unmute" : "Mute"}>
                              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                          </button>
                          <button onClick={toggleVideo} className={`p-3 rounded-xl ${isVideoOff ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-white/20'}`} title={isVideoOff ? "Turn Video On" : "Turn Video Off"}>
                              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                          </button>
                          <button onClick={toggleScreenShare} className={`p-3 rounded-xl ${isScreenSharing ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/20'}`} title="Share Screen">
                              <Monitor size={20} />
                          </button>
                          <div className="w-px bg-white/20 mx-1"></div>
                          <button onClick={handleEndStream} className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-bold text-xs shadow-lg shadow-red-900/50" title="End Stream">
                              <Square size={16} fill="currentColor" /> END
                          </button>
                     </div>
                </div>
            ) : (
                <div className="text-white animate-pulse">Initializing...</div>
            )}
        </div>
        
        <div className="h-64 md:h-full md:w-96 bg-gray-900 border-l border-gray-800 flex flex-col z-20 shadow-2xl">
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <h3 className="text-white font-black text-lg truncate">{streamTitle}</h3>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-pink-500 font-bold uppercase tracking-wider">Stream Chat</span>
                    <div className="flex gap-2">
                         <button className="text-gray-400 hover:text-white transition-colors"><Share2 size={16} /></button>
                         <div className="flex items-center text-pink-500 gap-1 text-xs font-bold"><Heart size={14} fill="currentColor"/> {likes}</div>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <Chat messages={messages} onSendMessage={handleSendMessage} />
            </div>
        </div>
    </div>
  );
};

// Placeholder Radio Icon
const Radio: React.FC<{size?:number}> = ({size=24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
);

export default SoloLiveView;
