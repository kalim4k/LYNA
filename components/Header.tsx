import React from 'react';
import { Bell, User } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface HeaderProps {
  onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenProfile }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 relative overflow-hidden rounded-full shadow-sm border border-gray-100 bg-white">
            <img 
              src={LOGO_URL} 
              alt="LYNA Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-gray-900">LYNA</span>
        </div>
        
        <div className="flex items-center gap-4 text-gray-600">
          <button className="relative p-1 hover:bg-gray-100/50 rounded-full transition-colors">
            <Bell size={22} strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={onOpenProfile}
            className="p-1 hover:bg-gray-100/50 rounded-full transition-colors hover:text-emerald-600"
          >
             <User size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;