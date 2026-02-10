
import React from 'react';

interface LogoProps {
  onClick?: () => void;
  size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ onClick, size = 'small' }) => {
  const containerSize = size === 'large' ? 'w-32 h-32' : 'w-10 h-10';
  
  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center justify-center perspective-1000 transition-all duration-700 hover:rotate-12 ${containerSize}`}
      title="How CareBuddy works"
    >
      {/* Background Shadow Pulse */}
      <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all duration-700 scale-150"></div>
      
      {/* Outer Rotating Diamond Frame */}
      <div className="absolute inset-0 border border-amber-500/20 rotate-45 group-hover:rotate-[135deg] transition-transform duration-1000 ease-in-out"></div>
      
      {/* The Main Symbol: An Interlocking Geometric Anchor */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Diamond Core */}
        <div className="w-1/2 h-1/2 absolute border-2 border-amber-500 rotate-45 group-hover:scale-125 transition-transform duration-500"></div>
        
        {/* Inner Circle (The Eye) */}
        <div className="w-1/4 h-1/4 absolute bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] group-hover:bg-white transition-colors"></div>
        
        {/* Cross Elements */}
        <div className="w-full h-[2px] bg-amber-500/40 absolute scale-x-75 group-hover:scale-x-110 transition-transform"></div>
        <div className="h-full w-[2px] bg-amber-500/40 absolute scale-y-75 group-hover:scale-y-110 transition-transform"></div>
      </div>

      {/* Orbital Points */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full"></div>
      
      {size === 'large' && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">
             The Care Anchor
           </span>
        </div>
      )}
    </button>
  );
};

export default Logo;
