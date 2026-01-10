import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-xs sm:max-w-sm rounded-3xl p-6 shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-white/20">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5 text-red-500 mx-auto ring-4 ring-red-50/50">
          <AlertTriangle size={28} strokeWidth={2.5} />
        </div>
        
        <h3 className="text-xl font-bold text-center text-stone-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-center text-stone-500 text-sm mb-8 leading-relaxed font-medium">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors active:scale-95"
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Supprimer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;