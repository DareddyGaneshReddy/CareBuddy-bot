
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface TranscriptListProps {
  messages: Message[];
}

const TranscriptList: React.FC<TranscriptListProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-10 py-32 space-y-16 no-scrollbar scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-10 text-center max-w-sm mx-auto animate-in fade-in duration-1000">
          <p className="serif text-3xl italic font-light tracking-wide leading-relaxed opacity-40">
            "Your narrative is safe. <br/> Process at your own pace."
          </p>
          <div className="w-px h-24 bg-gradient-to-b from-slate-800 to-transparent" />
        </div>
      ) : (
        messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.role === 'buddy' ? 'items-start' : 'items-end'} animate-in fade-in duration-700`}
          >
             <div className="max-w-[90%] md:max-w-[70%] space-y-4 group">
                <div className={`flex items-center gap-4 ${msg.role === 'buddy' ? 'flex-row' : 'flex-row-reverse'}`}>
                   <span className={`text-[8px] uppercase tracking-[0.5em] font-black transition-colors ${msg.role === 'buddy' ? 'text-amber-500' : 'text-slate-500'}`}>
                      {msg.role === 'buddy' ? 'System_Buddy' : 'Subject_User'}
                   </span>
                   <div className="flex-1 w-12 h-px bg-slate-800" />
                </div>
                
                <div className={`hologram-glass px-10 py-8 transition-all duration-700 border-l-2 ${msg.role === 'buddy' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700 bg-slate-900/30'}`}>
                   <p className={`serif text-2xl md:text-3xl leading-snug font-light tracking-tight ${
                     msg.role === 'buddy' 
                       ? 'text-slate-100' 
                       : 'text-slate-400 italic'
                   }`}>
                     {msg.text}
                   </p>
                </div>
             </div>
          </div>
        ))
      )}
      <div className="h-64" /> 
    </div>
  );
};

export default TranscriptList;
