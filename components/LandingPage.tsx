
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Users, Monitor, ArrowRight, Video, Lock, Sparkles, UserCheck } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-inter overflow-x-hidden selection:bg-pink-500 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-pink-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 transform perspective-1000 rotate-x-12 scale-150"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
            {/* Floating 3D Elements (CSS Only) */}
            <div className="absolute top-20 left-10 hidden md:block animate-float">
                <Logo size="lg" className="opacity-50" />
            </div>
            <div className="absolute bottom-40 right-10 hidden md:block animate-float animation-delay-1500">
                <Zap size={48} className="text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
            </div>

            <div className="mb-6 inline-block">
                <span className="bg-gray-800/80 backdrop-blur-md border border-gray-700 px-4 py-1.5 rounded-full text-xs font-bold text-pink-400 flex items-center gap-2 shadow-xl animate-fade-in-up">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    NOW LIVE: SEASON 4
                </span>
            </div>

            {/* MAIN LOGO HERO */}
            <div className="mb-8 animate-fade-in-up animation-delay-200">
                <Logo size="xl" className="mx-auto" />
            </div>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 font-medium animate-fade-in-up animation-delay-400">
                The high-stakes, real-time dating elimination game where <span className="text-white font-bold">you</span> control the chaos.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
                <button 
                    onClick={onEnter}
                    className="btn-brand px-10 py-5 rounded-full text-lg font-black italic tracking-wider shadow-2xl flex items-center gap-2 group"
                >
                    ENTER STUDIO <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold bg-black/30 px-4 py-2 rounded-full border border-white/10">
                    <ShieldCheck size={16} /> 18+ ID VERIFICATION REQUIRED
                </div>
            </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
                <div className="w-1 h-3 bg-white rounded-full"></div>
            </div>
        </div>
      </div>

      {/* --- STATS TICKER --- */}
      <div className="bg-pink-600 py-3 overflow-hidden whitespace-nowrap -rotate-1 border-y-4 border-black">
          <div className="inline-block animate-marquee font-black italic text-black text-xl">
             POP THE BALLOON • FIND LOVE • WIN CASH • REAL TIME • NO FILTERS • POP THE BALLOON • FIND LOVE • WIN CASH • REAL TIME • NO FILTERS •
          </div>
          <div className="inline-block animate-marquee font-black italic text-black text-xl" aria-hidden="true">
             POP THE BALLOON • FIND LOVE • WIN CASH • REAL TIME • NO FILTERS • POP THE BALLOON • FIND LOVE • WIN CASH • REAL TIME • NO FILTERS •
          </div>
      </div>

      {/* --- SAFETY & VERIFICATION --- */}
      <section className="py-24 relative bg-gray-900">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                  <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-black border border-gray-800 rounded-2xl p-8">
                          <div className="flex items-center gap-4 mb-6">
                               <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/50">
                                   <UserCheck size={32} />
                               </div>
                               <div>
                                   <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Safety First</div>
                                   <h3 className="text-2xl font-bold text-white">Biometric ID Verification</h3>
                               </div>
                          </div>
                          <div className="space-y-4">
                              <div className="flex items-center gap-3 text-gray-400">
                                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0"><Lock size={12}/></div>
                                  <p className="text-sm">Govt. ID Scan Required for Entry</p>
                              </div>
                              <div className="flex items-center gap-3 text-gray-400">
                                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0"><Video size={12}/></div>
                                  <p className="text-sm">Real-time Liveness Check</p>
                              </div>
                              <div className="flex items-center gap-3 text-gray-400">
                                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0"><ShieldCheck size={12}/></div>
                                  <p className="text-sm">Strict 18+ Age Gate Enforcement</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="order-1 md:order-2">
                  <h2 className="text-4xl md:text-5xl font-black italic mb-6">REAL PEOPLE.<br/><span className="text-blue-500">REAL SAFETY.</span></h2>
                  <p className="text-gray-400 text-lg leading-relaxed mb-6">
                      We utilize advanced AI-powered identity verification to ensure every single user is a verified adult. No bots. No fakes. No minors.
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest border-l-4 border-blue-500 pl-4">
                      Powered by Stripe Identity
                  </p>
              </div>
          </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 container mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className="text-4xl font-black italic text-white mb-4">THE STUDIO <span className="text-pink-500">EXPERIENCE</span></h2>
              <p className="text-gray-400 max-w-xl mx-auto">More than just dating. It's a full-stack production suite in your browser.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                  icon={<Monitor size={32} className="text-purple-400" />}
                  title="Screen Sharing"
                  desc="Go live solo or in-game and share your screen. Perfect for watch parties, gaming, or showing off your portfolio."
              />
              <FeatureCard 
                  icon={<Sparkles size={32} className="text-yellow-400" />}
                  title="AI Host CupidBot"
                  desc="Our Gemini-powered AI host roasts contestants, gives advice, and detects lies in real-time."
              />
              <FeatureCard 
                  icon={<Users size={32} className="text-pink-400" />}
                  title="Poly & Niche Lobbies"
                  desc="Find your tribe. From 'Gamers' to 'Poly Couples', create or join lobbies that match your specific vibe."
              />
          </div>
      </section>

      {/* --- CTA --- */}
      <div className="py-32 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent"></div>
           <div className="relative z-10">
               <h2 className="text-5xl md:text-7xl font-black italic text-white mb-8">READY TO <span className="text-pink-500">POP?</span></h2>
               <button 
                onClick={onEnter}
                className="btn-brand px-12 py-6 rounded-full text-xl font-black italic shadow-2xl hover:scale-105 transition-transform"
               >
                   JOIN THE SHOW
               </button>
               <p className="mt-6 text-gray-500 text-xs font-bold uppercase tracking-widest">
                   By entering you agree to our Terms & Conditions
               </p>
           </div>
      </div>

    </div>
  );
};

const FeatureCard = ({icon, title, desc}: any) => (
    <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-pink-500/50 transition-colors group">
        <div className="mb-6 w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
);

export default LandingPage;
