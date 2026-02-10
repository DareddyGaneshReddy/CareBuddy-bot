
import React from 'react';

interface VisualizerProps {
  isSpeaking: boolean;
  isBuddy: boolean;
  active: boolean;
  isThinking?: boolean;
  isMuted?: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isSpeaking, isBuddy, active, isThinking, isMuted }) => {
  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Background Deep Glow */}
      <div className={`absolute inset-0 rounded-full transition-all duration-[2000ms] blur-[100px] opacity-60 ${
        active 
          ? isBuddy ? 'bg-amber-500/20' : 'bg-blue-500/10'
          : 'bg-transparent'
      }`} />

      {/* The Fluid Amorphous Blob */}
      <div className="relative flex items-center justify-center">
        {/* Layer 1: Outer Aura */}
        <div 
          className={`absolute transition-all duration-1000 ease-out ${
            active ? 'opacity-30' : 'opacity-0'
          } ${isBuddy ? 'bg-amber-500' : 'bg-slate-400'}`}
          style={{
            width: isSpeaking ? '320px' : '280px',
            height: isSpeaking ? '320px' : '280px',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animation: active ? 'morph 8s ease-in-out infinite' : 'none',
            filter: 'blur(40px)',
          }}
        />

        {/* Layer 2: Mid-Layer Pulse */}
        <div 
          className={`absolute transition-all duration-700 ease-out ${
            active ? 'opacity-50' : 'opacity-10'
          } ${isBuddy ? 'bg-amber-400' : 'bg-slate-500'}`}
          style={{
            width: isSpeaking ? '240px' : '200px',
            height: isSpeaking ? '240px' : '200px',
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
            animation: active ? 'morph 6s ease-in-out infinite reverse' : 'none',
            filter: 'blur(20px)',
          }}
        />

        {/* Layer 3: The Core Entity */}
        <div 
          className={`relative z-10 flex items-center justify-center transition-all duration-500 ${
            active 
              ? isMuted 
                ? 'bg-slate-800 border-slate-700' 
                : isBuddy 
                  ? 'bg-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)] border-amber-300' 
                  : 'bg-white shadow-[0_0_50px_rgba(255,255,255,0.2)] border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
          style={{
            width: isSpeaking ? '140px' : '120px',
            height: isSpeaking ? '140px' : '120px',
            borderRadius: '50%',
            borderWidth: '2px',
            transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {/* Inner Activity Ring */}
          {(isThinking || isSpeaking) && (
            <div className={`absolute inset-0 rounded-full border-2 border-t-transparent border-white/40 animate-spin`} />
          )}
          
          {/* Center Point */}
          <div className="w-2 h-2 bg-slate-900 rounded-full" />
        </div>
      </div>

      {/* State Text */}
      <div className="absolute -bottom-12 flex flex-col items-center gap-2">
        {isThinking && (
          <div className="flex items-center gap-2 animate-pulse">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-500">I'm thinking...</span>
          </div>
        )}
        {active && !isSpeaking && !isThinking && (
          <span className="text-[8px] uppercase tracking-[0.5em] font-bold text-slate-500 opacity-50">I'm listening to you</span>
        )}
      </div>

      <style>{`
        @keyframes morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
      `}</style>
    </div>
  );
};

export default Visualizer;
