import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, quantity: number, variant: ProductVariant | null, total: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const totalPrice = currentPrice * quantity;

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleBuy = () => {
    onAddToCart(product, quantity, selectedVariant, totalPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Content - Sheet Style */}
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-300">
        
        {/* Drag Handle Area */}
        <div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-12 h-1.5 bg-gray-300/80 rounded-full mt-2 backdrop-blur-sm"></div>
        </div>

        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/10 hover:bg-black/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Image Area */}
        <div className="relative h-64 bg-gray-100 shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-4 left-6 text-white">
             <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                {product.category === 'tea' ? 'Thé' : 'Farine'}
             </span>
             <h2 className="text-2xl font-bold leading-tight">{product.name}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto no-scrollbar">
          
          <p className="text-gray-500 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector (If Flours) */}
          {product.variants && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Choisir le poids</span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      selectedVariant?.label === variant.label
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {variant.label} <span className="opacity-70 text-[10px] ml-1">{variant.price}F</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Price Calculation */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4 bg-white px-1.5 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                <button 
                    onClick={handleDecrement}
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-4 text-center font-semibold text-gray-900 text-lg">{quantity}</span>
                <button 
                    onClick={handleIncrement}
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Plus size={18} />
                </button>
            </div>
            
            <div className="text-right">
                <span className="block text-xs text-gray-400 font-medium">Prix total</span>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {totalPrice.toLocaleString()} <span className="text-sm text-gray-500 font-medium">FCFA</span>
                </span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 pt-0 bg-white">
          <button 
            onClick={handleBuy}
            className="w-full bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} />
            Commander
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;