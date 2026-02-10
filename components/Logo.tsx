
import React from 'react';

interface LogoProps {
  onClick?: () => void;
  size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ onClick, size = 'small' }) => {
  const containerSize = size === 'large' ? 'w-40 h-40' : 'w-12 h-12';
  const iconSize = size === 'large' ? 'w-24 h-24' : 'w-8 h-8';
  
  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 ${containerSize}`}
      title="How CareBuddy works"
    >
      <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700 scale-150 animate-pulse"></div>
      
      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize} transition-all duration-500 text-amber-500`}
          style={{
            animation: 'heartbeat 1.5s ease-in-out infinite'
          }}
        >
          <path 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            className="opacity-40 group-hover:opacity-100 transition-opacity"
          />
          <path 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            fill="currentColor" 
            className="scale-[0.6] origin-center opacity-80 group-hover:scale-[0.8] transition-transform duration-500"
          />
          <circle cx="12" cy="10" r="1.5" fill="white" className="group-hover:r-2 transition-all" />
        </svg>
      </div>

      {size === 'large' && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.6em] opacity-40 group-hover:opacity-100 transition-opacity duration-500">
             Open Your Heart
           </span>
        </div>
      )}

      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
          70% { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  );
};

export default Logo;
