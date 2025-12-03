
import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Gamepad2, Sparkles, Users, ShoppingBag } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to LovePop!",
    text: "I'm CupidBot, your AI host. I'm here to help you find love... or roast you trying. LovePop is a high-stakes elimination game where you control the chaos.",
    icon: <Sparkles size={48} className="text-pink-500" />
  },
  {
    title: "The Game Lobby",
    text: "Head to the 'Play Game' tab to find Public Lobbies or host your own. We have categories for everyone—from 'Gamers' to 'Poly Couples'.",
    icon: <Gamepad2 size={48} className="text-purple-500" />
  },
  {
    title: "Pop or Keep?",
    text: "As the Picker, you'll see 6 contestants. If you don't like their vibe, hit the big RED button to POP their balloon. Narrow it down to one winner.",
    icon: <div className="w-12 h-12 rounded-full bg-red-600 border-4 border-red-800 shadow-lg"></div>
  },
  {
    title: "AI & Chaos",
    text: "I'm always watching! I'll provide real-time commentary, lie detection, and even 'Wingman' advice. Plus, check the Chaos Menu to use Helium Voice or Upside Down mode!",
    icon: <Sparkles size={48} className="text-yellow-400" />
  },
  {
    title: "Creator Economy",
    text: "Earn Credits by playing. Buy gifts in the Marketplace. If you receive gifts, you earn real cash you can withdraw via Stripe.",
    icon: <ShoppingBag size={48} className="text-green-400" />
  },
  {
    title: "You're Ready!",
    text: "That's the basics. Go find a match, start a solo stream, or just spectate the drama. Good luck!",
    icon: <Users size={48} className="text-blue-400" />
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const stepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[9000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-900 border-2 border-pink-500 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(236,72,153,0.3)] relative overflow-hidden flex flex-col">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-20">
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center z-10">
          
          {/* Animated Icon Container */}
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-700 animate-float">
            {stepData.icon}
          </div>

          <h2 className="text-2xl font-black italic text-white mb-4">
            {stepData.title}
          </h2>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-8 min-h-[80px]">
            {stepData.text}
          </p>

          {/* Dots Indicator */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-pink-500' : 'bg-gray-700'}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${currentStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              Back
            </button>
            <button 
              onClick={handleNext}
              className="flex-[2] btn-brand py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2"
            >
              {currentStep === STEPS.length - 1 ? "Let's Play!" : "Next"} <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
