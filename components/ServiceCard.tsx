import React from 'react';
import { Service } from '../types';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <div 
        onClick={() => onBook(service)}
        className="group bg-white rounded-[24px] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col h-full border border-gray-100/50"
    >
      {/* Image Section - highly rounded */}
      <div className="aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden relative mb-3">
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Subtle price tag overlay on image */}
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
             <span className="text-[10px] font-bold text-gray-900 tracking-tight">
                {service.price.toLocaleString()} F
             </span>
        </div>
      </div>

      <div className="px-1 flex flex-col flex-grow">
        {/* Title */}
        <h4 className="font-semibold text-gray-900 text-[13px] leading-snug mb-1 line-clamp-2">
            {service.title}
        </h4>
        
        {/* Unit/Subtitle */}
        {service.priceUnit && (
             <p className="text-[10px] text-gray-400 font-medium mb-3">
                 {service.priceUnit}
             </p>
        )}

        {/* Action Button - Minimalist Pill */}
        <div className="mt-auto pt-2">
            <button 
                className="w-full bg-gray-100 group-hover:bg-gray-900 text-gray-900 group-hover:text-white text-[11px] font-semibold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
                Commander
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;