import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-transparent">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        /* Animation cinématographique pour LYNA */
        @keyframes cinematicReveal {
          0% {
            opacity: 0;
            letter-spacing: 0.1em;
            filter: blur(12px);
            transform: scale(0.95);
          }
          40% {
            opacity: 1;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            letter-spacing: 0.5em; /* Ecartement final large */
            transform: scale(1);
          }
        }

        @keyframes expandSubtitle {
          0% {
            opacity: 0;
            letter-spacing: 0.1em;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            letter-spacing: 0.6em;
            transform: translateY(0);
          }
        }
        
        @keyframes growLine {
          0% { width: 0; opacity: 0; }
          100% { width: 60px; opacity: 1; }
        }
        
        .main-title {
          background: linear-gradient(
            90deg, 
            #064e3b 20%, 
            #34d399 50%, 
            #064e3b 80%
          );
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          
          /* Combinaison : Reveal lent + Shimmer continu */
          animation: 
            shimmer 3.5s linear infinite,
            cinematicReveal 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          
          /* Pour éviter le saut de layout durant l'animation de spacing */
          white-space: nowrap;
        }

        .subtitle-animate {
          opacity: 0;
          animation: expandSubtitle 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.8s; /* Décalage pour laisser le temps à LYNA d'apparaitre */
        }

        .line-animate {
          opacity: 0;
          animation: growLine 1.2s ease-out forwards;
          animation-delay: 0.6s;
        }
      `}</style>

      <div className="relative flex flex-col items-center justify-center z-10 p-8">
        {/* Main Title - LYNA */}
        {/* Utilisation d'un seul h1 pour une animation fluide du letter-spacing */}
        <h1 className="text-5xl md:text-6xl font-bold main-title mb-5 leading-none">
          LYNA
        </h1>

        {/* Decorative Line */}
        <div className="h-[2px] bg-emerald-500/40 rounded-full line-animate mb-5 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>

        {/* Subtitle - EMPIRE */}
        <span className="text-[10px] font-bold text-stone-400 uppercase subtitle-animate tracking-widest">
          Empire
        </span>
      </div>

      {/* Background glow effects */}
      <div className="absolute w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
    </div>
  );
};

export default LoadingScreen;