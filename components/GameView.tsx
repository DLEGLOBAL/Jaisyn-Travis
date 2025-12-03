
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Peer, MediaConnection } from 'peerjs';
import { Contestant, GameSettings, Poll, ChatMessage, User } from '../types';
import ContestantCard from './ContestantCard';
import VideoFeed from './VideoFeed';
import AIHost from './AIHost';
import Soundboard, { SFX } from './Soundboard';
import StoreModal from './StoreModal';
import Confetti from './Confetti';
import SocialHub from './SocialHub';
import PollOverlay from './PollOverlay';
import ChaosMenu from './ChaosMenu';
import AdminDashboard from './AdminDashboard';
import DebugOverlay from './DebugOverlay';
import AgeVerificationModal from './AgeVerificationModal';
import ChromaKeyEffect from './ChromaKeyEffect';
import Logo from './Logo';
import { Heart, Timer, Bomb, ShoppingBag, EyeOff, Eye, Share2, Trophy, PictureInPicture, Menu, RotateCw, Users, Copy, ArrowRight, Play, Radio, Pause, FastForward, BarChart2, RefreshCw, Zap, Plus, Globe, MapPin, Search, Music, Coffee, Gamepad2, MessageSquare, Sparkles, Lock, Video, SlidersHorizontal, X, Loader2 } from 'lucide-react';

interface GameViewProps {
  user: User;
  settings: GameSettings;
  updateUserCredits: (newCredits: number) => void;
  onVerificationComplete?: () => void;
}

type GameMode = 'MENU' | 'HOST' | 'CONTESTANT' | 'SPECTATOR';

const JOBS = ["Barista", "Influencer", "Software Eng", "Model", "Student", "DJ", "Chef", "Nurse", "Artist", "Crypto Trader", "Personal Trainer", "Writer", "Gamer", "Start-up Founder"];
const BIOS = ["Here for a good time, not a long time.", "Looking for my soulmate.", "I love travel and pizza.", "Swipe right... oh wait.", "Just broke up, need a rebound.", "I have 3 cats.", "Vote for me!", "Too cool for this.", "My mom made me do this.", "Professional napper.", "Looking for a gym partner.", "I can cook better than you."];
const SENTIMENTS = ['HAPPY', 'NERVOUS', 'FLIRTY', 'ANGRY'] as const;

const LOBBY_CATEGORIES = [
  { id: 'NEAR_ME', label: 'Near Me', icon: <MapPin size={16} /> },
  { id: 'UNDER_30', label: 'Under 30', icon: <Heart size={16} /> },
  { id: '30_40', label: '30-40', icon: <Heart size={16} /> },
  { id: 'MATURE', label: 'Mature 40+', icon: <Users size={16} />, restricted: true },
  { id: 'POLY_COUPLES', label: 'Poly: Couples', icon: <Users size={16} className="text-purple-400" />, restricted: true },
  { id: 'POLY_UNICORNS', label: 'Poly: Unicorns', icon: <Sparkles size={16} className="text-purple-400" />, restricted: true },
  { id: 'POLY_MINGLE', label: 'Poly: Mingle', icon: <MessageSquare size={16} className="text-purple-400" />, restricted: true },
  { id: 'LGBTQ', label: 'LGBTQ+', icon: <Heart size={16} className="text-pink-500" /> },
  { id: 'GAMERS', label: 'Gamers', icon: <Gamepad2 size={16} /> },
  { id: 'SPEED', label: 'Speed Dating', icon: <Timer size={16} /> },
  { id: 'DEEP', label: 'Deep Talk', icon: <MessageSquare size={16} /> },
  { id: 'MUSIC', label: 'Music Lovers', icon: <Music size={16} /> },
  { id: 'CASUAL', label: 'Casual', icon: <Coffee size={16} /> },
  { id: 'ANIME', label: 'Anime Fans', icon: <Sparkles size={16} /> },
];

const GameView: React.FC<GameViewProps> = ({ user, settings, updateUserCredits, onVerificationComplete }) => {
  const [gameMode, setGameMode] = useState<GameMode>('MENU');
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [hostId, setHostId] = useState(''); 
  const [hostStream, setHostStream] = useState<MediaStream | undefined>(undefined); 
  const [round, setRound] = useState(1);
  const [activeCategory, setActiveCategory] = useState('NEAR_ME');
  
  const [newLobbyName, setNewLobbyName] = useState(`${user.username}'s Room`);
  const [newLobbyCategory, setNewLobbyCategory] = useState('NEAR_ME');
  const [isPublicLobby, setIsPublicLobby] = useState(true);

  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [pendingLobbyId, setPendingLobbyId] = useState<string | null>(null);

  // Initialize with empty lobbies for production-ready state
  const [publicLobbies, setPublicLobbies] = useState<any[]>([]);
  const [isSearchingLobbies, setIsSearchingLobbies] = useState(false);

  // Simulate lobby search when category changes
  useEffect(() => {
    setIsSearchingLobbies(true);
    // In production, fetch from API here
    const timer = setTimeout(() => {
        setIsSearchingLobbies(false);
        // setPublicLobbies([]); // Keep empty unless real data comes in
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeCategory]);
  
  const [popSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3'));
  const [joinSound] = useState(new Audio(SFX.join));
  
  const [isDoubleBlind, setIsDoubleBlind] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPopEffect, setShowPopEffect] = useState(false); 
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [myStream, setMyStream] = useState<MediaStream | undefined>(undefined);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, MediaConnection>>(new Map());
  const pickerVideoRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(t => t - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const initPeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);
        
        const newPeer = new Peer(); 
        peerRef.current = newPeer;

        newPeer.on('open', (id) => {
          setMyPeerId(id);
        });

        newPeer.on('call', (call) => {
          if (connectionsRef.current.size >= 6) {
             call.close();
             return;
          }
          call.answer(stream);
          call.on('stream', (remoteStream) => {
             setContestants(prev => {
                const exists = prev.find(c => c.peerId === call.peer);
                if (exists) return prev;
                joinSound.currentTime = 0;
                joinSound.play().catch(e => console.log("Join sound blocked", e));

                const randomJob = JOBS[Math.floor(Math.random() * JOBS.length)];
                const randomBio = BIOS[Math.floor(Math.random() * BIOS.length)];
                const randomSentiment = SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];

                const newContestant: Contestant = {
                    id: call.peer,
                    name: `Contestant ${prev.length + 1}`,
                    age: 18 + Math.floor(Math.random() * 15),
                    job: randomJob,
                    bio: randomBio,
                    imageUrl: '',
                    stream: remoteStream,
                    status: 'ACTIVE',
                    isLocal: false,
                    peerId: call.peer,
                    compatibility: Math.floor(Math.random() * 100),
                    sentiment: randomSentiment,
                    mysteryFact: 'Ask me anything!',
                    isMysteryRevealed: false,
                    superLikes: 0,
                    isImmune: false,
                    giftsReceived: 0,
                    connectionQuality: 'GOOD',
                    isVerified: false,
                    clubName: '',
                    hasPetCam: false,
                    isWearingPaperBag: false,
                    heliumVoice: false
                };
                connectionsRef.current.set(call.peer, call);
                if (prev.length === 0) setIsTimerActive(true);
                return [...prev, newContestant];
             });
          });
        });

      } catch (err) {
        console.error("Failed to get media or init peer", err);
      }
    };

    if (!settings.bandwidthSaver) {
        initPeer();
    }

    return () => {
      peerRef.current?.destroy();
      myStream?.getTracks().forEach(track => track.stop());
      connectionsRef.current.forEach(conn => conn.close());
    };
  }, [settings.bandwidthSaver]);

  const handleJoinGame = (mode: 'CONTESTANT' | 'SPECTATOR') => {
    if (!hostId || !peerRef.current || !myStream) return;
    
    // In production, we would check the lobby details from API before joining
    
    setGameMode(mode);
    
    const call = peerRef.current.call(hostId, myStream);
    
    call.on('stream', (remoteStream) => {
        setHostStream(remoteStream);
        joinSound.currentTime = 0;
        joinSound.play().catch(e => console.log("Join sound blocked", e));
    });
    
    call.on('close', () => {
        alert("Disconnected from Host");
        setGameMode('MENU');
    });
    
    call.on('error', (err) => {
        console.error("Call error", err);
        alert("Could not connect to host.");
        setGameMode('MENU');
    });
  };

  const handleLobbyClick = (lobbyId: string) => {
    setPendingLobbyId(lobbyId);
    setHostId(lobbyId); 
  };
  
  const handleStartHosting = () => {
      const catDef = LOBBY_CATEGORIES.find(c => c.id === newLobbyCategory);
      if (catDef?.restricted && !user.isIdVerified) {
          setShowAgeVerification(true);
          return;
      }
      setGameMode('HOST');
  };
  
  const onAgeVerified = () => {
      if (onVerificationComplete) onVerificationComplete();
      setShowAgeVerification(false);
  };

  const handlePop = useCallback((id: string) => {
    if (navigator.vibrate) navigator.vibrate(200);
    popSound.currentTime = 0;
    popSound.play().catch(e => console.log("Audio play failed", e));
    setContestants(prev => prev.map(c => c.id === id ? { ...c, status: 'ELIMINATED' } : c));
    setTimeRemaining(60); 
    setShowPopEffect(true);
  }, [popSound]);

  const handleRevive = (id: string) => {
    setContestants(prev => prev.map(c => c.id === id ? { ...c, status: 'ACTIVE' } : c));
  };

  const handleSuperLike = (id: string) => {
    setContestants(prev => prev.map(c => c.id === id ? { ...c, superLikes: c.superLikes + 1 } : c));
  };

  const handleRevealMystery = (id: string) => {
    setContestants(prev => prev.map(c => c.id === id ? { ...c, isMysteryRevealed: true } : c));
  };
  
  const handleGift = (id: string) => {
    if (user.credits >= 100) {
        updateUserCredits(user.credits - 100);
        setContestants(prev => prev.map(c => c.id === id ? { ...c, giftsReceived: c.giftsReceived + 1 } : c));
    } else {
        alert("Not enough credits!");
    }
  };

  const handleStorePurchase = (item: string, targetId?: string) => {
    if (item === 'IMMUNITY' && targetId && user.credits >= 500) {
        updateUserCredits(user.credits - 500);
        setContestants(prev => prev.map(c => c.id === targetId ? { ...c, isImmune: true } : c));
    }
    if (item === 'PAID_POP' && targetId && user.credits >= 1000) {
        updateUserCredits(user.credits - 1000);
        handlePop(targetId);
    }
    if (item === 'BOOST' && user.credits >= 200) {
        updateUserCredits(user.credits - 200);
        alert("Profile Boosted!");
    }
  };

  const handleChaosTrigger = (effect: string) => {
    const costs: Record<string, number> = { 'HELIUM': 50, 'UPSIDE_DOWN': 100, 'PET_CAM': 25 };
    const cost = costs[effect] || 0;
    if (user.credits >= cost) updateUserCredits(user.credits - cost);
  };

  const handleAdminAction = (action: string) => {
    if (action === 'TOGGLE_DEBUG') setShowDebugOverlay(p => !p);
  };

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  const addTime = () => setTimeRemaining(t => t + 30);
  const handleNextRound = () => {
    if (round < 3) {
      setRound(r => r + 1);
      setTimeRemaining(60);
      setIsTimerActive(true);
    } else {
      endGame();
    }
  };
  const createQuickPoll = () => {
    setActivePoll({
      id: Date.now().toString(),
      question: "Who should be popped next?",
      options: [{ label: "Top Row", votes: 12 }, { label: "Bottom Row", votes: 8 }, { label: "Anyone!", votes: 5 }],
      isActive: true, totalVotes: 25
    });
    setTimeout(() => setActivePoll(null), 10000);
  };
  const reviveAll = () => setContestants(prev => prev.map(c => ({ ...c, status: 'ACTIVE' })));
  const handleSendMessage = (text: string) => {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: user.username, text, timestamp: Date.now() }]);
  };
  const endGame = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    setGameMode('MENU');
    setContestants([]);
    connectionsRef.current.forEach(c => c.close());
    connectionsRef.current.clear();
  };
  const copyToClipboard = () => {
      navigator.clipboard.writeText(myPeerId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
  };
  const activeCount = contestants.filter(c => c.status === 'ACTIVE').length;
  // const filteredLobbies = publicLobbies.filter(lobby => activeCategory === 'NEAR_ME' ? true : lobby.category === activeCategory);

  if (gameMode === 'MENU') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-6 relative overflow-hidden">
        <AgeVerificationModal isOpen={showAgeVerification} onClose={() => setShowAgeVerification(false)} onVerified={onAgeVerified} />
        
        <div className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 md:pb-0 overflow-y-auto md:overflow-visible">
            <div className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-700 shadow-2xl flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-pink-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                        <Radio className="text-white" size={24} />
                    </div>
                    <div><h2 className="text-2xl font-black italic text-white">HOST GAME</h2><p className="text-gray-400 text-xs">Create your own show.</p></div>
                </div>
                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Lobby Name</label>
                        <input value={newLobbyName} onChange={(e) => setNewLobbyName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                        <select value={newLobbyCategory} onChange={(e) => setNewLobbyCategory(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none appearance-none">
                            {LOBBY_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label} {cat.restricted ? '(18+)' : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between bg-gray-900 p-3 rounded-xl border border-gray-600">
                        <div className="flex items-center gap-2">
                             {isPublicLobby ? <Globe size={18} className="text-green-400" /> : <EyeOff size={18} className="text-gray-400" />}
                             <span className="text-sm font-bold text-gray-300">{isPublicLobby ? 'Public Lobby' : 'Private (Invite Only)'}</span>
                        </div>
                        <input type="checkbox" checked={isPublicLobby} onChange={(e) => setIsPublicLobby(e.target.checked)} className="w-5 h-5 accent-pink-500"/>
                    </div>
                </div>
                <button onClick={handleStartHosting} className="w-full btn-brand py-4 rounded-xl font-bold text-white shadow-lg mt-auto flex items-center justify-center gap-3">
                    <Play size={20} fill="currentColor" /> START HOSTING
                </button>
            </div>

            <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-700 shadow-2xl flex flex-col h-[500px]">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Globe size={20} className="text-blue-400" /> Public Lobbies</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar shrink-0">
                    {LOBBY_CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-colors ${activeCategory === cat.id ? 'btn-brand shadow-lg' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar relative">
                    {isSearchingLobbies ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                             <Loader2 size={32} className="animate-spin text-pink-500 mb-2" />
                             <p className="text-xs font-bold">Searching for live lobbies...</p>
                        </div>
                    ) : publicLobbies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                            <Users size={32} className="mb-2" />
                            <p className="text-xs">No active lobbies found.</p>
                            <p className="text-[10px]">Start one yourself!</p>
                        </div>
                    ) : (
                        publicLobbies.map((lobby) => {
                            const cat = LOBBY_CATEGORIES.find(c => c.id === lobby.category);
                            return (
                                <div key={lobby.id} onClick={() => handleLobbyClick(lobby.id)} className={`p-3 rounded-xl border flex justify-between items-center group cursor-pointer transition-colors ${pendingLobbyId === lobby.id ? 'bg-gray-700 border-pink-500' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`}>
                                    <div>
                                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                            {lobby.name}
                                            {cat?.restricted && <Lock size={12} className="text-red-500" />}
                                        </h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">{lobby.distance} • <Users size={10} /> {lobby.count}/7</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                {pendingLobbyId && (
                     <div className="flex gap-2 animate-fade-in-up">
                         <button onClick={() => handleJoinGame('CONTESTANT')} className="flex-1 btn-brand py-3 rounded-xl font-bold text-sm">JOIN GAME</button>
                         <button onClick={() => handleJoinGame('SPECTATOR')} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                             <Eye size={16} /> WATCH
                         </button>
                     </div>
                )}

                {/* Join by ID Input */}
                <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input 
                            placeholder="Paste Host ID directly..." 
                            value={hostId}
                            onChange={(e) => setHostId(e.target.value)}
                            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-pink-500"
                        />
                         <button onClick={() => handleJoinGame('CONTESTANT')} className="btn-brand-outline px-3 py-2 rounded-lg font-bold text-xs">JOIN</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'CONTESTANT') {
      return (
          <div className="w-full h-full bg-black relative flex flex-col">
              <ChromaKeyEffect 
                 src="https://iepmdfvilmhuasszfyrs.supabase.co/storage/v1/object/public/Love%20Pop/poplove.mp4" 
                 isActive={showPopEffect} 
                 onComplete={() => setShowPopEffect(false)}
              />

              <div className="flex-1 relative overflow-hidden">
                  {hostStream ? <VideoFeed isLocal={false} stream={hostStream} label="THE HOST" status="ACTIVE" settings={settings} /> : <div className="text-white text-center p-10">Connecting...</div>}
                  <div className="absolute top-4 right-4 w-28 h-40 bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                      <VideoFeed isLocal={true} stream={myStream} label="You" status="ACTIVE" settings={settings} />
                  </div>
              </div>
              <div className="h-20 bg-gray-900 border-t border-gray-800 p-4 flex items-center justify-between pb-safe-area-inset-bottom">
                  <div><h3 className="text-white font-bold text-sm">Contestant Mode</h3><p className="text-xs text-gray-500">Wait for the Picker.</p></div>
                  <button onClick={() => setGameMode('MENU')} className="px-4 py-2 bg-red-900/30 text-red-500 border border-red-900 rounded-lg text-xs font-bold">LEAVE</button>
              </div>
          </div>
      );
  }

  const isSpectator = gameMode === 'SPECTATOR';

  return (
    <div className={`flex flex-col md:flex-row w-full h-full overflow-hidden ${isUpsideDown ? 'rotate-180' : ''}`}>
      {showConfetti && <Confetti />}
      {showDebugOverlay && <DebugOverlay />}
      <PollOverlay poll={activePoll} />
      
      {/* VIDEO POP EFFECT handled via global overlay prop, or localized here if specific logic requires */}
      <ChromaKeyEffect 
         src="https://iepmdfvilmhuasszfyrs.supabase.co/storage/v1/object/public/Love%20Pop/poplove.mp4" 
         isActive={showPopEffect} 
         onComplete={() => setShowPopEffect(false)}
      />

      {isMobileControlsOpen && (
         <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md p-6 overflow-y-auto animate-fade-in-up md:hidden pb-32">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black italic text-white">HOST <span className="text-pink-500">CONTROLS</span></h2>
                <button onClick={() => setIsMobileControlsOpen(false)} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"><X size={24} /></button>
             </div>
             <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-gray-400 text-sm mb-3 flex items-center gap-2"><Timer size={16}/> GAME FLOW</h3>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button onClick={toggleTimer} className={`col-span-2 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${isTimerActive ? 'bg-yellow-600' : 'bg-green-600'}`}>{isTimerActive ? 'PAUSE TIMER' : 'START TIMER'}</button>
                        <button onClick={addTime} className="bg-gray-700 text-white font-bold text-sm py-2 rounded-lg">+30s</button>
                        <button onClick={handleNextRound} className="btn-brand text-white font-bold text-sm py-2 rounded-lg">Next Round</button>
                    </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                     <h3 className="font-bold text-gray-400 text-sm mb-3 flex items-center gap-2"><Music size={16}/> SOUNDBOARD</h3>
                     <Soundboard />
                </div>

                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                     <h3 className="font-bold text-gray-400 text-sm mb-3 flex items-center gap-2"><Zap size={16}/> CHAOS MODE</h3>
                     <ChaosMenu onTrigger={handleChaosTrigger} credits={user.credits} />
                </div>
             </div>
         </div>
      )}

      <div className="flex-1 h-full overflow-y-auto p-2 md:p-6 custom-scrollbar pb-32 md:pb-6 relative order-1 md:order-1">
        <div className="md:hidden flex justify-between items-center mb-4 px-2 pt-2 text-white sticky top-0 z-30 bg-gray-950/80 backdrop-blur pb-2">
          <div className="flex items-center gap-2">
             <div className="bg-pink-600/20 p-1.5 rounded-lg"><Logo size="sm" className="h-6" /></div>
             {isSpectator && <span className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">SPECTATING</span>}
          </div>
          <div className="flex items-center gap-2">
             {!isSpectator && (
                <button onClick={() => setIsMobileControlsOpen(true)} className="btn-brand text-white p-1.5 rounded-lg border border-pink-500/50 shadow-lg shadow-pink-900/50"><SlidersHorizontal size={16} /></button>
             )}
             <button onClick={() => setIsStoreOpen(true)} className="bg-yellow-500/20 text-yellow-400 p-1.5 rounded-lg border border-yellow-500/50"><ShoppingBag size={16} /></button>
             <button onClick={() => setIsSocialOpen(true)} className="bg-gray-800 text-white p-1.5 rounded-lg border border-gray-700"><Menu size={16} /></button>
          </div>
        </div>

        {activeCount > 0 && <div className="w-full h-1 bg-gray-800 mb-4 rounded-full overflow-hidden sticky top-12 z-20 md:static"><div className={`h-full transition-all duration-1000 ease-linear ${timeRemaining < 10 ? 'bg-red-500' : 'bg-pink-500'}`} style={{ width: `${(timeRemaining / 60) * 100}%` }}></div></div>}

        {contestants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 animate-fade-in">
                <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-4 border-4 border-gray-800 relative">
                    <Users size={48} className="text-gray-600" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">LOBBY IS OPEN</h2>
                <button onClick={copyToClipboard} className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-700 flex items-center gap-3 group transition-all">
                    <span className="text-xs font-mono text-gray-500">ID:</span><code className="text-pink-400 font-bold text-lg">{myPeerId || 'Loading...'}</code>
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mx-auto max-w-6xl pb-32 md:pb-0">
            {contestants.map((contestant) => (
                <ContestantCard 
                key={contestant.id} 
                contestant={contestant} 
                onPop={handlePop} 
                onRevive={handleRevive}
                onSuperLike={handleSuperLike}
                onRevealMystery={handleRevealMystery}
                onGift={handleGift}
                isPicker={!isSpectator} 
                isDoubleBlind={isDoubleBlind}
                settings={settings}
                />
            ))}
            </div>
        )}
      </div>

      <div className={`hidden md:flex fixed bottom-0 left-0 w-full md:static md:w-[380px] md:h-screen bg-gray-900/95 backdrop-blur-md border-l border-gray-700 z-50 flex-col shrink-0 text-white`}>
        <div ref={pickerVideoRef} className="w-full aspect-[3/4] bg-black relative overflow-hidden border-b border-gray-700 group">
          <VideoFeed isLocal={true} stream={myStream} label={user.username + " (Host)"} status="ACTIVE" settings={settings} />
          {isSpectator && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-2xl z-50">SPECTATOR MODE</div>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           {!isSpectator ? (
               <>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <button onClick={toggleTimer} className={`col-span-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${isTimerActive ? 'bg-yellow-600' : 'bg-green-600'}`}>{isTimerActive ? 'PAUSE' : 'START'}</button>
                    <button onClick={addTime} className="bg-gray-700 text-white font-bold text-xs">+30s</button>
                    <button onClick={handleNextRound} className="btn-brand text-white font-bold text-xs">Next</button>
                  </div>
                  <Soundboard />
                  <ChaosMenu onTrigger={handleChaosTrigger} credits={user.credits} />
               </>
           ) : (
               <div className="text-center p-6">
                   <p className="text-gray-400 text-sm mb-4">You are watching as a spectator. You can chat and send gifts, but you cannot control the game.</p>
                   <button onClick={() => setGameMode('MENU')} className="bg-red-600 text-white py-2 px-4 rounded font-bold">Leave Game</button>
               </div>
           )}
        </div>
      </div>

      <AIHost contestants={contestants} />
      <StoreModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} credits={user.credits} contestants={contestants} onPurchase={handleStorePurchase} />
      <SocialHub isOpen={isSocialOpen} onClose={() => setIsSocialOpen(false)} messages={chatMessages} onSendMessage={handleSendMessage} />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} onAction={handleAdminAction} />
    </div>
  );
};

export default GameView;
