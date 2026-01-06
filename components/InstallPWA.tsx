import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détection iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
      // Afficher après un petit délai
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Pour iOS, on affiche aussi le popup s'il n'est pas en mode standalone
    if (ios && !(window.navigator as any).standalone) {
        setTimeout(() => setIsVisible(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptInstall) {
        return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        setPromptInstall(null);
        setIsVisible(false);
    });
  };

  const handleClose = () => {
      setIsVisible(false);
  };

  if (!isVisible && (!supportsPWA && !isIOS)) return null;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white/95 backdrop-blur-xl border border-emerald-100 p-4 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-full border border-emerald-100">
            <img 
                src="https://celinaroom.com/wp-content/uploads/2026/01/ChatGPT-Image-6-janv.-2026-22_05_41.png" 
                alt="Logo" 
                className="w-10 h-10 object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">Installer l'App</h3>
            <p className="text-[11px] text-gray-500 font-medium">Pour une meilleure expérience</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {isIOS ? (
                <div className="text-[10px] text-gray-500 font-medium px-2 leading-tight bg-gray-50 py-2 rounded-2xl">
                    Appuyez sur <Share size={12} className="inline mx-1" /> puis "Sur l'écran d'accueil"
                </div>
            ) : (
                <button 
                    onClick={handleInstallClick}
                    className="bg-stone-900 text-white px-5 py-3 rounded-full text-xs font-bold shadow-lg hover:bg-black active:scale-95 transition-all flex items-center gap-2"
                >
                    <Download size={16} />
                    Installer
                </button>
            )}
            
            <button 
                onClick={handleClose}
                className="p-2.5 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;