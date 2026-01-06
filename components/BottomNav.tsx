import React from 'react';
import { ShoppingBag, FileText, User, Phone } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.BOUTIQUE, label: 'Boutique', icon: ShoppingBag },
    { id: Tab.COMMANDES, label: 'Commandes', icon: FileText },
    { id: Tab.PROFIL, label: 'Profil', icon: User },
    { id: Tab.CONTACT, label: 'Contact', icon: Phone },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-gray-100 pb-safe pt-2">
      <div className="max-w-md mx-auto flex justify-between items-end px-6 h-14 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-end w-16 space-y-1 group active:scale-95 transition-transform duration-200 ease-out"
            >
              <div className={`relative p-1 transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                 <Icon 
                    size={26} 
                    strokeWidth={isActive ? 2 : 1.5} 
                    className={`transition-colors duration-300 ${
                        isActive 
                        ? 'text-gray-900 fill-gray-900/10' 
                        : 'text-gray-400 fill-transparent group-hover:text-gray-500'
                    }`} 
                 />
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;