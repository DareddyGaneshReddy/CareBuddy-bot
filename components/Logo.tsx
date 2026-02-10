
import React from 'react';

interface LogoProps {
  onClick?: () => void;
  size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ onClick, size = 'small' }) => {
  const dimension = size === 'large' ? 'w-24 h-24' : 'w-8 h-8';
  const iconSize = size === 'large' ? '48' : '24';

  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95 duration-500 ${dimension}`}
      title="System Highlights"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/40 transition-all duration-500"></div>
      
      {/* The Logo Symbol */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-colors duration-500"
      >
        <path 
          d="M12 2L15 8H21L16 12L18 18L12 14L6 18L8 12L3 8H9L12 2Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-amber-500"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" className="text-amber-400 group-hover:text-amber-300 animate-pulse" />
      </svg>
      
      {/* Orbital Ring */}
      <div className="absolute inset-0 border border-amber-500/30 rounded-full animate-[spin_8s_linear_infinite] group-hover:border-amber-500/60"></div>
      
      {size === 'large' && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] text-amber-500 uppercase tracking-[0.6em] font-black opacity-40 group-hover:opacity-100 transition-opacity">
          Insight_Anchor
        </div>
      )}
    </button>
  );
};

export default Logo;
