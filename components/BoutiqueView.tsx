import React, { useEffect, useState } from 'react';
import { PRODUCTS, SERVICES } from '../constants';
import ProductCard from './ProductCard';
import ServiceCard from './ServiceCard';
import LoadingScreen from './LoadingScreen';
import { Product, Service } from '../types';
import { Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface BoutiqueViewProps {
  onOpenProduct: (product: Product) => void;
}

const BoutiqueView: React.FC<BoutiqueViewProps> = ({ onOpenProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingOfflineData, setUsingOfflineData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Petite pause artificielle pour laisser l'animation respirer (optionnel, mais plus joli)
      await new Promise(r => setTimeout(r, 800));

      if (!supabase) {
        setProducts(PRODUCTS);
        setServices(SERVICES);
        setUsingOfflineData(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch Products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');

        if (productsError) throw productsError;

        // Fetch Services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');

        if (servicesError) throw servicesError;

        if (productsData) {
          setProducts(productsData as Product[]);
        }

        if (servicesData) {
          const mappedServices: Service[] = servicesData.map((s: any) => ({
            id: s.id,
            title: s.title,
            price: s.price,
            priceUnit: s.price_unit,
            description: s.description,
            image: s.image,
            icon: s.icon
          }));
          setServices(mappedServices);
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setProducts(PRODUCTS);
        setServices(SERVICES);
        setUsingOfflineData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const teas = products.filter(p => p.category === 'tea');
  const flours = products.filter(p => p.category === 'flour');

  const handleServiceClick = (service: Service) => {
    const serviceProduct: Product = {
        id: service.id,
        name: service.title,
        category: 'service',
        price: service.price,
        description: service.description,
        image: service.image, 
        variants: undefined
    };
    onOpenProduct(serviceProduct);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="px-5 py-6 space-y-10 pb-28 bg-gray-50/50 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero / Welcome - Clean & Bold */}
      <div className="pt-4 pb-2">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-2">Bonjour,</h1>
        <p className="text-gray-500 text-lg font-medium">Que souhaitez-vous aujourd'hui ?</p>
        {usingOfflineData && (
             <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-xs rounded-lg flex items-center gap-2 border border-amber-100">
                <AlertCircle size={14} />
                <span>Mode hors ligne : données locales affichées.</span>
             </div>
        )}
      </div>

      {/* Section: Thés */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Infusions & Thés</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {teas.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onOpenModal={onOpenProduct} 
            />
          ))}
        </div>
      </section>

      {/* Section: Farines */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Nos Farines</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {flours.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onOpenModal={onOpenProduct} 
            />
          ))}
        </div>
      </section>

      {/* Section: Services - Highlighted */}
      <section className="relative">
        <div className="flex items-center gap-2 mb-5 px-1">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                <Sparkles size={14} fill="currentColor" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Nos Services</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {services.map(service => (
            <ServiceCard 
                key={service.id} 
                service={service} 
                onBook={handleServiceClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default BoutiqueView;