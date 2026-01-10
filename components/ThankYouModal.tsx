import React from 'react';
import { Check } from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/80 backdrop-blur-xl transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-100 text-center transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        
        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-in zoom-in duration-500 delay-150">
          <Check size={32} strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 mb-2 tracking-tight">Merci !</h2>
        <p className="text-stone-500 font-medium leading-relaxed mb-8">
          Votre commande a bien été reçue.<br/>Nous la préparons avec soin.
        </p>

        <button 
          onClick={onClose}
          className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-stone-200"
        >
          Retour à la boutique
        </button>
      </div>
    </div>
  );
};

export default ThankYouModal;