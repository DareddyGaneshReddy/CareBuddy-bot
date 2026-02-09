
import React from 'react';

interface VisualizerProps {
  isSpeaking: boolean;
  isBuddy: boolean;
  active: boolean;
  isMuted?: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isSpeaking, isBuddy, active, isMuted }) => {
  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Background Radiance (Warmth) */}
      <div className={`absolute inset-0 rounded-full transition-all duration-[3000ms] blur-[120px] ${
        active 
          ? isBuddy ? 'bg-amber-500/10' : 'bg-slate-400/5'
          : 'bg-transparent'
      }`} />

      {/* Orbital Rings (Technical) */}
      {[1, 2, 3].map((layer) => (
        <div
          key={layer}
          className={`absolute rounded-full transition-all duration-[2000ms] ease-in-out border-t-2 border-l border-r-0 border-b-0 ${
            active 
              ? isBuddy 
                ? 'border-amber-500/30' 
                : 'border-slate-400/20'
              : 'border-slate-800'
          }`}
          style={{
            width: `${180 + layer * 60}px`,
            height: `${180 + layer * 60}px`,
            transform: `rotate(${active ? layer * 120 : 0}deg) scale(${isSpeaking && !isMuted ? 1.05 + (layer * 0.02) : 1})`,
            animation: active ? `rotate-ring-${layer} ${10 + layer * 5}s infinite linear` : 'none',
            opacity: active ? 0.4 : 0.1,
          }}
        />
      ))}

      {/* The Core Insight (Mature Center) */}
      <div className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-[1000ms] border ${
        active 
          ? isMuted 
            ? 'border-slate-700 bg-slate-900/50 grayscale'
            : isBuddy 
              ? 'border-amber-500/50 bg-amber-500/5 shadow-[0_0_80px_rgba(245,158,11,0.2)]' 
              : 'border-slate-400/50 bg-slate-400/5 shadow-[0_0_80px_rgba(255,255,255,0.05)]'
          : 'border-slate-800 bg-slate-900/20 shadow-inner'
      }`}>
        {/* Pulsing Data Core */}
        <div className={`w-32 h-32 rounded-full border border-dashed transition-all duration-500 ${
          isSpeaking ? 'scale-110 border-amber-500/40 rotate-180' : 'scale-100 border-slate-700 rotate-0'
        }`} />
        
        {/* Static Inner Glow */}
        <div className={`absolute w-16 h-16 rounded-full blur-xl transition-all duration-700 ${
          active ? (isBuddy ? 'bg-amber-500/40' : 'bg-slate-400/30') : 'bg-transparent'
        }`} />

        <div className="absolute inset-0 flex items-center justify-center">
           <div className={`w-1 h-1 rounded-full bg-white transition-all duration-300 ${isSpeaking ? 'scale-[20] opacity-10' : 'scale-100 opacity-100'}`} />
        </div>
      </div>

      <style>{`
        @keyframes rotate-ring-1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotate-ring-2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes rotate-ring-3 { from { transform: rotate(45deg); } to { transform: rotate(405deg); } }
      `}</style>
    </div>
  );
};

export default Visualizer;
