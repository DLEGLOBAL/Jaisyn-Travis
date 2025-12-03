import React from 'react';

const Confetti: React.FC = () => {
  // Generate fixed random positions for a simple CSS confetti effect
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDuration: 2 + Math.random() * 3,
    animationDelay: Math.random() * 2,
    color: ['#ec4899', '#a855f7', '#3b82f6', '#eab308'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 w-3 h-3 rounded-sm animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.animationDelay}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation-name: confetti-fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default Confetti;