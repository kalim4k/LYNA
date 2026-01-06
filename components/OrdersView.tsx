import React, { useEffect, useState } from 'react';
import { PackageOpen, Clock } from 'lucide-react';
import { OrderItem } from '../types';
import { supabase } from '../supabaseClient';
import LoadingScreen from './LoadingScreen';

interface OrdersViewProps {
  localOrders: OrderItem[]; // Keep local orders for immediate feedback if needed, or replace entirely
}

const OrdersView: React.FC<OrdersViewProps> = ({ localOrders }) => {
  const [orders, setOrders] = useState<OrderItem[]>(localOrders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!supabase) return;
      
      setLoading(true);
      // Petite pause pour l'animation
      await new Promise(r => setTimeout(r, 600));

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedOrders: OrderItem[] = data.map((item: any) => ({
            id: item.id,
            productName: item.product_name,
            variantLabel: item.variant_label,
            quantity: item.quantity,
            totalPrice: item.total_price,
            date: item.date || new Date(item.created_at).toLocaleDateString('fr-FR')
          }));
          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error("Erreur chargement commandes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [localOrders]);

  if (loading && orders.length === 0) {
     return <LoadingScreen />;
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-stone-900">Mes Commandes</h1>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-stone-400">
            <PackageOpen size={64} strokeWidth={1} className="mb-4 text-stone-300" />
            <p className="font-medium">Aucune commande pour le moment</p>
            <p className="text-xs mt-2 text-center max-w-[200px]">Visitez la boutique pour découvrir nos produits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-medium uppercase mb-1">
                        <Clock size={12} />
                        {order.date}
                    </div>
                    <h3 className="font-bold text-stone-800 text-sm">{order.productName}</h3>
                    {order.variantLabel && <p className="text-xs text-stone-500">Format: {order.variantLabel}</p>}
                    <p className="text-xs text-stone-600 mt-1">Quantité: <span className="font-semibold text-stone-900">{order.quantity}</span></p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-emerald-700 font-bold">{order.totalPrice.toLocaleString()} F</span>
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-medium">En attente</span>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersView;