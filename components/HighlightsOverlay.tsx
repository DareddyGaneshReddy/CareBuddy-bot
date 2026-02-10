
import React from 'react';

interface HighlightsOverlayProps {
  onClose: () => void;
}

const HighlightsOverlay: React.FC<HighlightsOverlayProps> = ({ onClose }) => {
  const highlights = [
    {
      title: "Real Listening",
      desc: "CareBuddy listens to the way you talk—your pauses, your tone, and your silence—just like a real brother would."
    },
    {
      title: "Total Privacy",
      desc: "What you say stays here. No judgment, no data sharing. Just a safe space to vent."
    },
    {
      title: "Grounded Talk",
      desc: "No corporate fluff or robot-speak. Just simple, honest conversation to help you feel grounded."
    },
    {
      title: "Always Available",
      desc: "Day or night, if the world feels too loud, I'm here to help you find some quiet."
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="hologram-glass p-8 md:p-12 max-w-2xl w-full border-amber-500/30 space-y-12 shadow-[0_0_100px_rgba(245,158,11,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/40"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40"></div>

        <div className="space-y-4 text-center">
          <h2 className="serif text-4xl text-slate-100 font-light italic">How it works.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {highlights.map((h, i) => (
            <div key={i} className="space-y-2 group">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:shadow-[0_0_10px_rgba(245,158,11,1)] transition-all"></div>
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">{h.title}</h3>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-light pl-4 border-l border-slate-800">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 border border-slate-800 hover:border-amber-500/50 text-slate-500 hover:text-amber-500 text-[10px] uppercase font-black tracking-[0.4em] transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default HighlightsOverlay;
