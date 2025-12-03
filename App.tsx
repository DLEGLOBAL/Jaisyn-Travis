
import React, { useState, useEffect } from 'react';
import { User, GameSettings, Post } from './types';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';
import GameView from './components/GameView';
import FeedView from './components/FeedView';
import ProfileView from './components/ProfileView';
import MessagesView from './components/MessagesView';
import SoloLiveView from './components/SoloLiveView';
import MarketplaceView from './components/MarketplaceView';
import FindMeView from './components/FindMeView';
import SettingsModal from './components/SettingsModal';
import ChromaKeyEffect from './components/ChromaKeyEffect';
import Logo from './components/Logo';
import OnboardingTour from './components/OnboardingTour'; 
import AgeVerificationModal from './components/AgeVerificationModal';
import { Home, Gamepad2, MessageSquare, User as UserIcon, Radio, Settings, ShoppingBag, Compass } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

// Supabase Direct Download Link (Fast, Supports Range Requests for Video)
const VIDEO_URL = "https://iepmdfvilmhuasszfyrs.supabase.co/storage/v1/object/public/Love%20Pop/poplove.mp4";

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'FEED' | 'GAME' | 'PROFILE' | 'MESSAGES' | 'SOLO' | 'MARKET' | 'FINDME'>('GAME'); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Transition State
  const [isTransitionActive, setIsTransitionActive] = useState(false);

  // Onboarding & Verification State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Global Posts State
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const [settings, setSettings] = useState<GameSettings>({
    videoQuality: '1080p',
    lowLatency: false,
    greenScreen: false,
    colorBlindMode: false,
    captions: false,
    theme: 'CYBERPUNK',
    incognitoMode: false,
    geoFencing: false,
    bandwidthSaver: false,
    blurBackground: false,
    serverRegion: 'US-EAST',
    batterySaver: false
  });

  // --- SUPABASE AUTH LISTENER ---
  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setLoadingSession(false);
      }
    });

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Refresh logic handled by fetchUserProfile
        fetchUserProfile(session.user.id, session.user.email || '');
        if (showLanding) setShowLanding(false); // Skip landing if logged in
      } else {
        setAuthUser(null);
        setLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // SELF-HEALING: If profile is missing (PGRST116), create a default one
      if (error && error.code === 'PGRST116') {
          console.warn("Profile not found. Starting auto-creation sequence...");
          
          // 1. Wait for Auth Propagation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 2. Refresh session to ensure we have the absolute latest token
          const { data: sessionData } = await supabase.auth.refreshSession();
          
          // Strict check: Only create if we have a session AND the ID matches
          if (sessionData.session && sessionData.session.user.id === userId) {
            
            // 3. Double Check: Did the profile get created during the delay?
            const { data: retryCheck } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (retryCheck) {
                console.log("Profile appeared during delay. Using it.");
                data = retryCheck;
                error = null;
            } else {
                // 4. Attempt Creation
                const metaUsername = sessionData.session.user.user_metadata?.username;
                const defaultUsername = metaUsername || email.split('@')[0] + Math.floor(Math.random() * 1000);
                
                console.log("Inserting new profile for:", userId);

                // USE INSERT with minimal payload. Rely on DB defaults.
                const { error: createError } = await supabase
                  .from('profiles')
                  .insert([{
                      id: sessionData.session.user.id, // Strictly use session ID
                      username: defaultUsername,
                      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultUsername}`,
                  }]); // Do not chain .select() to avoid RLS read issues immediately
                
                if (createError) {
                   console.error("Auto-creation insert failed:", createError.message);
                   // Final Hail Mary: Try to fetch one last time (maybe race condition resolved)
                   const { data: finalRetry } = await supabase.from('profiles').select('*').eq('id', userId).single();
                   if (finalRetry) {
                       data = finalRetry;
                       error = null;
                   }
                } else {
                    // Insert succeeded, now fetch
                    const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
                    data = newProfile;
                    error = null;
                }
            }
          } else {
              console.warn("Session missing or ID mismatch during auto-creation.");
          }
      } 
      
      if (error && error.code !== 'PGRST116') {
         console.error("Error fetching profile:", error.message);
      }

      if (data) {
        const fullUser: User = {
            id: data.id,
            email: email,
            username: data.username || email.split('@')[0],
            avatarUrl: data.avatar_url,
            credits: data.credits || 0,
            earnings: data.earnings || 0,
            bio: data.bio,
            followers: 0, 
            following: 0,
            profileViews: data.profile_views || 0,
            customProfileHtml: data.custom_profile_html,
            profileMusicUrl: data.profile_music_url,
            isIdVerified: data.is_id_verified || false,
            stripeConnected: false,
            subscriptionTier: data.subscription_tier || 'FREE',
            badges: data.badges || [],
            entranceTheme: 'NONE',
            hasCompletedOnboarding: data.has_completed_onboarding || false,
        };
        setAuthUser(fullUser);

        // Check onboarding flows
        if (!fullUser.hasCompletedOnboarding) {
            setTimeout(() => setShowOnboarding(true), 2000);
        } else if (!fullUser.isIdVerified) {
            setTimeout(() => setShowVerification(true), 2000);
        }
      }
    } catch (err: any) {
      console.error("Profile Fetch Exception:", err.message || JSON.stringify(err));
    } finally {
      setLoadingSession(false);
    }
  };

  const triggerTransition = (callback: () => void) => {
    setIsTransitionActive(true);
    setTimeout(() => {
      callback();
    }, 800); 
    
    setTimeout(() => {
        setIsTransitionActive(false);
    }, 4000); 
  };

  const handleLandingEnter = () => {
      triggerTransition(() => {
          setShowLanding(false);
      });
  };

  const handleLogin = (user: any) => {
     // Trigger transition visually, but real state update comes from useEffect
     triggerTransition(() => {});
  };

  const handleLogout = async () => {
      triggerTransition(async () => {
        await supabase.auth.signOut();
        setIsSettingsOpen(false);
        setCurrentView('GAME');
        setShowLanding(true); 
      });
  };

  const handleTransitionComplete = () => {
      setIsTransitionActive(false);
  };

  const handleOnboardingComplete = async () => {
      setShowOnboarding(false);
      if (authUser) {
          const updatedUser = { ...authUser, hasCompletedOnboarding: true };
          setAuthUser(updatedUser);
          
          // Update DB
          await supabase.from('profiles').update({ has_completed_onboarding: true }).eq('id', authUser.id);

          if (!updatedUser.isIdVerified) {
             setTimeout(() => setShowVerification(true), 500);
          }
      }
  };

  const handleVerificationComplete = async () => {
      setShowVerification(false);
      if (authUser) {
          setAuthUser({ ...authUser, isIdVerified: true });
          // Update DB
          await supabase.from('profiles').update({ is_id_verified: true }).eq('id', authUser.id);
          alert("ID Verified Successfully! You now have full access.");
      }
  };

  const updateUserCredits = async (newCredits: number) => {
      if (authUser) {
          setAuthUser({ ...authUser, credits: newCredits });
          // Update DB
          await supabase.from('profiles').update({ credits: newCredits }).eq('id', authUser.id);
      }
  };

  const handleUpdateProfile = async (updated: Partial<User>) => {
      if (authUser) {
          setAuthUser({ ...authUser, ...updated });
          
          // Map React User fields to DB columns
          const dbUpdates: any = {};
          if (updated.username) dbUpdates.username = updated.username;
          if (updated.bio) dbUpdates.bio = updated.bio;
          if (updated.avatarUrl) dbUpdates.avatar_url = updated.avatarUrl;
          if (updated.profileMusicUrl) dbUpdates.profile_music_url = updated.profileMusicUrl;
          if (updated.customProfileHtml) dbUpdates.custom_profile_html = updated.customProfileHtml;

          await supabase.from('profiles').update(dbUpdates).eq('id', authUser.id);
      }
  };
  
  const handleMarketPurchase = (cost: number, itemName: string) => {
      if (authUser) {
          if (cost < 0) {
              updateUserCredits(authUser.credits + Math.abs(cost));
              // Handle Subscription Logic if needed
          } 
          else if (authUser.credits >= cost) {
              updateUserCredits(authUser.credits - cost);
              alert(`Purchased ${itemName}!`);
          } else {
              alert("Not enough credits!");
          }
      }
  };

  const handleCreatePost = (newPost: Post) => {
      // Optimistic update, actual DB save happens in FeedView
      setAllPosts(prev => [newPost, ...prev]);
  };

  const renderContent = () => {
      if (loadingSession) {
          return <div className="h-screen w-screen bg-black flex items-center justify-center text-pink-500 animate-pulse">Loading Studio...</div>;
      }

      if (showLanding && !authUser) {
          return <LandingPage onEnter={handleLandingEnter} />;
      }
    
      if (!authUser) {
        return <AuthScreen onLogin={handleLogin} />;
      }
    
      const themeBg = settings.theme === 'VICTORIAN' ? 'bg-slate-900' : 'bg-black';
    
      return (
        <div className={`flex h-[100dvh] w-screen overflow-hidden text-white ${themeBg} font-inter`}>
          <div className="hidden md:flex w-20 lg:w-64 flex-col border-r border-gray-800 bg-gray-900/50 backdrop-blur-md z-20">
             <div className="p-4 flex items-center justify-center lg:justify-start gap-3">
                 <Logo size="sm" className="hidden lg:block h-8" />
                 <Logo size="sm" className="lg:hidden h-8 w-8" />
             </div>
             
             <nav className="flex-1 p-4 space-y-2">
                <button onClick={() => setCurrentView('GAME')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'GAME' ? 'btn-brand shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <Gamepad2 size={20} /> <span className="hidden lg:inline font-bold">Play Game</span>
                </button>
                <button onClick={() => setCurrentView('FEED')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'FEED' ? 'btn-brand shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <Home size={20} /> <span className="hidden lg:inline font-bold">Social Feed</span>
                </button>
                <button onClick={() => setCurrentView('FINDME')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'FINDME' ? 'btn-brand shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <Compass size={20} /> <span className="hidden lg:inline font-bold">Find Me</span>
                </button>
                <button onClick={() => setCurrentView('MESSAGES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'MESSAGES' ? 'btn-brand shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <MessageSquare size={20} /> <span className="hidden lg:inline font-bold">Messages</span>
                </button>
                <button onClick={() => setCurrentView('SOLO')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'SOLO' ? 'btn-brand shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <Radio size={20} /> <span className="hidden lg:inline font-bold">Go Live Solo</span>
                </button>
                <button onClick={() => setCurrentView('MARKET')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'MARKET' ? 'btn-brand shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <ShoppingBag size={20} /> <span className="hidden lg:inline font-bold">Marketplace</span>
                </button>
                <button onClick={() => setCurrentView('PROFILE')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'PROFILE' ? 'btn-brand shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <UserIcon size={20} /> <span className="hidden lg:inline font-bold">Profile</span>
                </button>
             </nav>

             <div className="p-4 border-t border-gray-800">
                <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
                    <Settings size={20} /> <span className="hidden lg:inline font-bold">Settings</span>
                </button>
             </div>
          </div>

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-0 left-0 w-full bg-gray-900/90 backdrop-blur border-t border-gray-800 z-50 flex justify-around p-2 pb-safe-area-inset-bottom">
             <button onClick={() => setCurrentView('GAME')} className={`p-3 rounded-xl ${currentView === 'GAME' ? 'text-pink-500 bg-pink-900/20' : 'text-gray-400'}`}><Gamepad2 size={24} /></button>
             <button onClick={() => setCurrentView('FEED')} className={`p-3 rounded-xl ${currentView === 'FEED' ? 'text-pink-500 bg-pink-900/20' : 'text-gray-400'}`}><Home size={24} /></button>
             <button onClick={() => setCurrentView('FINDME')} className={`p-3 rounded-xl ${currentView === 'FINDME' ? 'text-pink-500 bg-pink-900/20' : 'text-gray-400'}`}><Compass size={24} /></button>
             <button onClick={() => setCurrentView('PROFILE')} className={`p-3 rounded-xl ${currentView === 'PROFILE' ? 'text-pink-500 bg-pink-900/20' : 'text-gray-400'}`}><UserIcon size={24} /></button>
          </div>

          <main className="flex-1 relative overflow-hidden">
             {currentView === 'GAME' && <GameView user={authUser} settings={settings} updateUserCredits={updateUserCredits} onVerificationComplete={handleVerificationComplete} />}
             {currentView === 'FEED' && <FeedView posts={allPosts} onCreatePost={handleCreatePost} user={authUser} />}
             {currentView === 'PROFILE' && <ProfileView user={authUser} currentUserId={authUser.id} isSelf={true} onUpdateProfile={handleUpdateProfile} onCreatePost={handleCreatePost} posts={allPosts.filter(p => p.userId === authUser.id)} />}
             {currentView === 'MESSAGES' && <MessagesView myUsername={authUser.username} />}
             {currentView === 'SOLO' && <SoloLiveView user={authUser} />}
             {currentView === 'MARKET' && <MarketplaceView user={authUser} onPurchase={handleMarketPurchase} />}
             {currentView === 'FINDME' && <FindMeView user={authUser} />}
          </main>
        
          <SettingsModal 
             isOpen={isSettingsOpen} 
             onClose={() => setIsSettingsOpen(false)} 
             settings={settings} 
             onUpdate={(k, v) => setSettings({ ...settings, [k]: v })}
             onLogout={handleLogout}
          />
        </div>
      );
  };

  return (
    <>
      <ChromaKeyEffect 
          src={VIDEO_URL}
          isActive={isTransitionActive}
          onComplete={handleTransitionComplete}
          className="z-[999999]"
      />
      <OnboardingTour 
          isOpen={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
          onComplete={handleOnboardingComplete}
      />
      <AgeVerificationModal 
          isOpen={showVerification} 
          onClose={() => { /* Mandatory */ }} 
          onVerified={handleVerificationComplete} 
      />
      {renderContent()}
    </>
  );
};

export default App;
