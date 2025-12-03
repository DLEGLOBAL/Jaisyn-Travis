
import React, { useState, useEffect } from 'react';

const DebugOverlay: React.FC = () => {
  const [fps, setFps] = useState(0);
  const [ping, setPing] = useState(0);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    
    const loop = () => {
      const now = performance.now();
      frames++;
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
        setPing(Math.floor(Math.random() * 40) + 10); // Mock ping fluctuation
      }
      requestAnimationFrame(loop);
    };
    
    const rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="fixed top-2 left-2 z-[9999] pointer-events-none font-mono text-[10px] text-green-500 bg-black/80 p-2 rounded border border-green-900/50">
      <div>FPS: {fps}</div>
      <div>PING: {ping}ms</div>
      <div>MEM: {Math.round((performance as any).memory?.usedJSHeapSize / 1048576 || 0)}MB</div>
      <div>VER: 2.4.0 (DEV)</div>
    </div>
  );
};

export default DebugOverlay;
