import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import BoutiqueView from './components/BoutiqueView';
import ContactView from './components/ContactView';
import OrdersView from './components/OrdersView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import AuthView from './components/AuthView';
import ProductModal from './components/ProductModal';
import LoadingScreen from './components/LoadingScreen';
import InstallPWA from './components/InstallPWA';
import ThankYouModal from './components/ThankYouModal'; // Import
import { Tab, Product, OrderItem, ProductVariant } from './types';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.BOUTIQUE);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false); // State for Thank You Modal
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
        setLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleAddToCart = async (product: Product, quantity: number, variant: ProductVariant | null, totalPrice: number) => {
    const dateStr = new Date().toLocaleDateString('fr-FR');

    const newOrderData = {
        user_id: session?.user.id,
        product_name: product.name,
        variant_label: variant?.label || null,
        quantity: quantity,
        total_price: totalPrice,
        date: dateStr,
        status: 'pending'
    };

    const localOrder: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      productName: product.name,
      variantLabel: variant?.label,
      quantity,
      totalPrice,
      date: dateStr
    };
    setOrders(prev => [localOrder, ...prev]);

    if (supabase && session) {
      try {
        const { error } = await supabase
          .from('orders')
          .insert([newOrderData]);
        
        if (error) {
            console.error('Error inserting order:', error);
            alert("Une erreur est survenue lors de la commande.");
        } else {
            // Replace alert with Thank You Modal
            setIsThankYouOpen(true);
        }
      } catch (err) {
        console.error('Connection error:', err);
      }
    } else {
        console.warn("Commande locale uniquement");
        setIsThankYouOpen(true);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.BOUTIQUE:
        return <BoutiqueView onOpenProduct={handleOpenProduct} />;
      case Tab.COMMANDES:
        return <OrdersView localOrders={orders} />;
      case Tab.CONTACT:
        return <ContactView />;
      case Tab.PROFIL:
        return <ProfileView session={session} onNavigateToAdmin={() => setActiveTab(Tab.ADMIN)} />;
      case Tab.ADMIN:
        return <AdminView />;
      default:
        return <BoutiqueView onOpenProduct={handleOpenProduct} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-md mx-auto shadow-2xl border-x border-stone-200 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-md mx-auto shadow-2xl border-x border-stone-200 flex flex-col justify-center">
        <InstallPWA />
        <AuthView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-stone-200">
      <Header onOpenProfile={() => setActiveTab(Tab.PROFIL)} />
      
      <main className="min-h-screen bg-stone-50 animate-in fade-in duration-300">
        {renderContent()}
      </main>

      <InstallPWA />

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
      
      {/* New Thank You Modal */}
      <ThankYouModal 
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;