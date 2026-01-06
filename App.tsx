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
import InstallPWA from './components/InstallPWA'; // Import PWA
import { Tab, Product, OrderItem, ProductVariant } from './types';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.BOUTIQUE);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]); // Local state fallback
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
        setLoading(false);
        return;
    }

    // Récupérer la session actuelle au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Écouter les changements d'auth (connexion/déconnexion)
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
    setTimeout(() => setSelectedProduct(null), 300); // Wait for animation
  };

  const handleAddToCart = async (product: Product, quantity: number, variant: ProductVariant | null, totalPrice: number) => {
    const dateStr = new Date().toLocaleDateString('fr-FR');

    // Préparation des données pour Supabase
    const newOrderData = {
        user_id: session?.user.id, // Liaison avec l'utilisateur connecté
        product_name: product.name,
        variant_label: variant?.label || null,
        quantity: quantity,
        total_price: totalPrice,
        date: dateStr,
        status: 'pending'
    };

    // Optimistic UI update (Local state)
    const localOrder: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      productName: product.name,
      variantLabel: variant?.label,
      quantity,
      totalPrice,
      date: dateStr
    };
    setOrders(prev => [localOrder, ...prev]);

    // Supabase Insert
    if (supabase && session) {
      try {
        const { error } = await supabase
          .from('orders')
          .insert([newOrderData]);
        
        if (error) {
            console.error('Error inserting order:', error);
            alert("Une erreur est survenue lors de la commande.");
        } else {
            alert("Commande envoyée avec succès !");
        }
      } catch (err) {
        console.error('Connection error:', err);
      }
    } else {
        // Fallback si pas de connexion (ne devrait pas arriver ici car session requise)
        console.warn("Commande locale uniquement (pas de session ou supabase)");
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

  // 1. État de chargement initial (vérification de la session)
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-md mx-auto shadow-2xl border-x border-stone-200 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  // 2. Si pas connecté, afficher UNIQUEMENT la page d'authentification
  if (!session) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-md mx-auto shadow-2xl border-x border-stone-200 flex flex-col justify-center">
        <InstallPWA />
        <AuthView />
      </div>
    );
  }

  // 3. Si connecté, afficher l'application complète
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

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;