import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal }) => {
  // Determine display price string
  const displayPrice = product.variants 
    ? `${Math.min(...product.variants.map(v => v.price))} F`
    : `${product.price} F`;

  return (
    <div className="group bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="aspect-square w-full bg-gray-50 overflow-hidden relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {/* Category Badge - Minimal */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-800 shadow-sm border border-white/50">
            {product.category === 'tea' ? 'Thé' : 'Farine'}
        </div>
      </div>
      
      <div className="p-3.5 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-emerald-600 font-bold text-sm">
            {displayPrice}
          </p>
        </div>
        
        <div className="mt-auto">
          <button 
            onClick={() => onOpenModal(product)}
            className="w-full bg-gray-900 text-white text-xs font-semibold py-2.5 px-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-sm"
          >
            <span>Commander</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;