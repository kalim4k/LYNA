import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { OrderItem, Product, Service, UserProfile, ProductVariant } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { 
  Package, 
  Users, 
  PlusCircle, 
  RefreshCw, 
  TrendingUp, 
  ShoppingBag,
  Sparkles,
  Loader2,
  ShieldCheck,
  User,
  Edit2,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle, 
  Phone,
  Trash2,
  Scale
} from 'lucide-react';

const AdminView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products' | 'services' | 'users'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Form States
  const [productForm, setProductForm] = useState<Partial<Product>>({ category: 'tea', price: 0, name: '', description: '', image: '', variants: [] });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({ price: 0, title: '', description: '', image: '', priceUnit: '' });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'service', id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setErrorMsg(null);
    if (activeSubTab === 'orders') fetchOrders();
    if (activeSubTab === 'users') fetchUsers();
    if (activeSubTab === 'products') fetchProducts();
    if (activeSubTab === 'services') fetchServices();
  }, [activeSubTab]);

  // --- FETCHING DATA ---

  const fetchOrders = async () => {
    setLoading(true);
    if (!supabase) return;
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*');
      
      if (error) throw error;
      
      if (ordersData) {
         const sortedOrders = ordersData.sort((a: any, b: any) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
         );

         const userIds = [...new Set(sortedOrders.map((o: any) => o.user_id).filter(Boolean))];
         let usersMap: Record<string, any> = {};
         if (userIds.length > 0) {
             const { data: uData } = await supabase.from('app_users').select('id, full_name, phone').in('id', userIds);
             uData?.forEach(u => usersMap[u.id] = u);
         }
         
         setOrders(sortedOrders.map((item: any) => ({
             id: item.id,
             productName: item.product_name,
             quantity: item.quantity,
             totalPrice: item.total_price,
             date: item.date,
             status: item.status || 'pending',
             variantLabel: item.variant_label,
             customerName: usersMap[item.user_id]?.full_name || 'Inconnu',
             customerPhone: usersMap[item.user_id]?.phone || ''
         })));
      }
    } catch (err: any) { 
        console.error("Erreur commandes:", err.message || err); 
    } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('app_users').select('*');
      if (error) throw error;
      if (data) setUsers(data as UserProfile[]);
    } catch (err: any) { 
        console.error("Erreur users:", err.message || err);
    } finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data) {
          setProducts(data.sort((a: any, b: any) => {
              if (b.created_at && a.created_at) return b.created_at.localeCompare(a.created_at);
              return 0;
          }) as Product[]);
      }
    } catch (err: any) { 
        console.error("Erreur produits:", err.message || err);
        setErrorMsg("Erreur chargement produits: " + err.message);
    } finally { setLoading(false); }
  };

  const fetchServices = async () => {
    setLoading(true);
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('services').select('*');
      if (error) throw error;
      if (data) {
        const mappedServices: Service[] = data.map((s: any) => ({
            id: s.id,
            title: s.title,
            price: s.price,
            priceUnit: s.price_unit,
            description: s.description,
            image: s.image
        }));
        setServices(mappedServices);
      }
    } catch (err: any) { 
        console.error("Erreur services:", err.message || err);
        setErrorMsg("Erreur chargement services: " + err.message);
    } finally { setLoading(false); }
  };

  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; 
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const sendWhatsApp = (phone: string | undefined, name: string | undefined) => {
      if (!phone) {
          alert("Pas de numéro de téléphone disponible.");
          return;
      }
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 8) {
          cleanPhone = '228' + cleanPhone;
      }
      const message = `Bonjour ${name || ''}, merci pour votre commande sur LYNA. Nous avons bien reçu votre demande.`;
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  // --- DELETE LOGIC ---

  const handleDeleteRequest = (type: 'product' | 'service', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !supabase) return;
    setIsDeleting(true);

    try {
      const tableName = deleteTarget.type === 'product' ? 'products' : 'services';
      const { error } = await supabase.from(tableName).delete().eq('id', deleteTarget.id);

      if (error) throw error;

      // Update Local State
      if (deleteTarget.type === 'product') {
        setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
        if (editingProductId === deleteTarget.id) handleCancelProductEdit();
      } else {
        setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
        if (editingServiceId === deleteTarget.id) handleCancelServiceEdit();
      }

      setDeleteTarget(null);
    } catch (error: any) {
      console.error("Delete Error:", error);
      alert(`Erreur lors de la suppression : ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- HANDLERS PRODUCTS ---

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...(productForm.variants || [])];
    if (index >= 0 && index < newVariants.length) {
      newVariants[index] = { ...newVariants[index], [field]: value };
      setProductForm({ ...productForm, variants: newVariants });
    }
  };

  const addVariant = () => {
    setProductForm({
      ...productForm,
      variants: [...(productForm.variants || []), { label: '500g', price: 1000 }]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(productForm.variants || [])];
    newVariants.splice(index, 1);
    setProductForm({ ...productForm, variants: newVariants });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!supabase) return;

    try {
      let imageUrl = productForm.image;
      if (productImageFile) {
        try { imageUrl = await compressAndConvertToBase64(productImageFile); } 
        catch (err) { alert("Image invalide."); setIsSubmitting(false); return; }
      }

      // Si c'est une farine, on s'assure qu'il y a un prix de base pour l'affichage (le min)
      let basePrice = Number(productForm.price) || 0;
      if (productForm.category === 'flour' && productForm.variants && productForm.variants.length > 0) {
          const prices = productForm.variants.map(v => Number(v.price));
          basePrice = Math.min(...prices);
      }

      const productData = { 
        name: productForm.name?.trim() || 'Produit sans nom',
        category: productForm.category,
        price: basePrice,
        description: productForm.description?.trim() || '',
        image: imageUrl || '',
        variants: productForm.category === 'flour' ? productForm.variants : null // On sauvegarde les variantes
      };

      if (editingProductId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProductId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }

      alert(editingProductId ? "Produit modifié !" : "Produit ajouté !");
      handleCancelProductEdit();
      await fetchProducts();
    } catch (error: any) {
      console.error("ERREUR SUPABASE:", error);
      alert(`Erreur: ${error.message || JSON.stringify(error)}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm(product);
    setEditingProductId(product.id);
    setProductImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelProductEdit = () => {
    setProductForm({ category: 'tea', price: 0, name: '', description: '', image: '', variants: [] });
    setEditingProductId(null);
    setProductImageFile(null);
  };

  // --- HANDLERS SERVICES ---

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!supabase) return;

    try {
      let imageUrl = serviceForm.image;
      if (serviceImageFile) {
         try { imageUrl = await compressAndConvertToBase64(serviceImageFile); } 
         catch (err) { alert("Erreur image."); setIsSubmitting(false); return; }
      }

      const serviceDataDB = {
          title: serviceForm.title?.trim() || 'Service sans titre',
          price: Number(serviceForm.price) || 0,
          price_unit: serviceForm.priceUnit?.trim() || '',
          description: serviceForm.description?.trim() || '',
          image: imageUrl || ''
      };

      if (editingServiceId) {
        const { error } = await supabase.from('services').update(serviceDataDB).eq('id', editingServiceId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([serviceDataDB]);
        if (error) throw error;
      }

      alert(editingServiceId ? "Service modifié !" : "Service ajouté !");
      handleCancelServiceEdit();
      await fetchServices();
    } catch (error: any) {
       console.error("ERREUR SERVICE:", error);
       alert(`Erreur: ${error.message}.`);
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleEditService = (service: Service) => {
      setServiceForm(service);
      setEditingServiceId(service.id);
      setServiceImageFile(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelServiceEdit = () => {
      setServiceForm({ price: 0, title: '', description: '', image: '', priceUnit: '' });
      setEditingServiceId(null);
      setServiceImageFile(null);
  };

  // --- COMMON HANDLERS ---

  const toggleUserRole = async (userId: string, currentRole: string | undefined) => {
    if (!supabase) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const prevUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'user' } : u));
    
    const { error } = await supabase.from('app_users').update({ role: newRole }).eq('id', userId);
    if (error) {
        alert("Erreur rôle: " + error.message);
        setUsers(prevUsers);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'completed' | 'cancelled') => {
    if (!supabase) return;
    const prevOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
        alert("Erreur status: " + error.message);
        setOrders(prevOrders);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 animate-in fade-in duration-500">
      <ConfirmationModal 
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'product' ? 'Supprimer le produit ?' : 'Supprimer le service ?'}
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Header Admin */}
      <div className="bg-stone-900 text-white p-6 rounded-b-[32px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          <div className="bg-white/10 p-2 rounded-full">
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
        </div>
        
        {/* Sub Navigation */}
        <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm overflow-x-auto no-scrollbar gap-1">
          <button onClick={() => setActiveSubTab('orders')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wide transition-all whitespace-nowrap ${activeSubTab === 'orders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-white'}`}><Package size={14} /> Commandes</button>
          <button onClick={() => setActiveSubTab('users')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wide transition-all whitespace-nowrap ${activeSubTab === 'users' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-white'}`}><Users size={14} /> Users</button>
          <button onClick={() => setActiveSubTab('products')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wide transition-all whitespace-nowrap ${activeSubTab === 'products' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-white'}`}><ShoppingBag size={14} /> Produits</button>
          <button onClick={() => setActiveSubTab('services')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wide transition-all whitespace-nowrap ${activeSubTab === 'services' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-white'}`}><Sparkles size={14} /> Services</button>
        </div>
      </div>

      <div className="px-4">
        {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {errorMsg}
            </div>
        )}

        {/* --- USERS TAB --- */}
        {activeSubTab === 'users' && (
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-stone-800">Gestion Utilisateurs</h2>
              <button onClick={fetchUsers} className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"><RefreshCw size={18} /></button>
            </div>
            {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div> : 
              users.map((user) => (
                <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-stone-900 text-white' : 'bg-gray-100 text-gray-500'}`}>{user.role === 'admin' ? <ShieldCheck size={20} /> : <User size={20} />}</div>
                      <div>
                          <h3 className="font-bold text-sm text-stone-900">{user.full_name || 'Sans nom'}</h3>
                          <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                   </div>
                   <button onClick={() => toggleUserRole(user.id, user.role)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all ${user.role === 'admin' ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{user.role === 'admin' ? 'Rétrograder' : 'Promouvoir Admin'}</button>
                </div>
              ))
            }
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeSubTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-stone-800">Commandes récentes</h2>
              <button onClick={fetchOrders} className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"><RefreshCw size={18} /></button>
            </div>
            {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div> : 
              orders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden">
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'completed' ? 'bg-emerald-500' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                   <div className="pl-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-0.5">{order.date}</p>
                          <h3 className="font-bold text-stone-900 text-lg">{order.customerName}</h3>
                          {order.customerPhone && (
                              <div className="flex items-center gap-1.5 text-stone-600 mt-0.5">
                                  <Phone size={12} className="text-emerald-600" />
                                  <p className="text-xs font-medium tracking-wide">{order.customerPhone}</p>
                              </div>
                          )}
                        </div>
                        
                        {/* WhatsApp Button */}
                        {order.customerPhone && (
                            <button 
                                onClick={() => sendWhatsApp(order.customerPhone, order.customerName)}
                                className="bg-emerald-50 text-emerald-600 p-2 rounded-full hover:bg-emerald-100 transition-colors"
                                title="Envoyer un message WhatsApp"
                            >
                                <MessageCircle size={20} />
                            </button>
                        )}
                      </div>
                      
                      <div className="bg-stone-50 p-3 rounded-xl mb-3 border border-stone-100/50">
                        <p className="font-medium text-sm text-stone-800">{order.productName}</p>
                        <div className="flex justify-between text-xs mt-1 text-stone-500">
                          <span>{order.variantLabel ? `Format: ${order.variantLabel}` : 'Standard'} x {order.quantity}</span>
                          <span className="font-bold text-stone-900">{order.totalPrice.toLocaleString()} F</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status === 'pending' ? 'En attente' : order.status === 'completed' ? 'Livré' : 'Annulé'}</span>
                          
                          {order.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-emerald-600 text-white p-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"><CheckCircle size={14} /> Valider</button>
                              <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="bg-white border border-red-200 text-red-500 p-2 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1"><XCircle size={14} /> Refuser</button>
                            </div>
                          )}
                      </div>
                   </div>
                </div>
              ))
            }
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeSubTab === 'products' && (
          <div className="space-y-6">
            {/* Formulaire Produit */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 transition-all">
              <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                {editingProductId ? <Edit2 size={20} className="text-emerald-600" /> : <PlusCircle size={20} className="text-emerald-600" />}
                {editingProductId ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h2>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">Nom du produit</label>
                  <input 
                    type="text" required
                    className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20"
                    value={productForm.name || ''}
                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-stone-500 uppercase">Catégorie</label>
                      <select 
                        className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        value={productForm.category}
                        onChange={e => setProductForm({...productForm, category: e.target.value as any})}
                      >
                        <option value="tea">Thé</option>
                        <option value="flour">Farine</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-stone-500 uppercase">Prix {productForm.category === 'flour' ? 'de base' : ''} (FCFA)</label>
                      <input 
                        type="number" required
                        className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20"
                        value={productForm.price || ''}
                        onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                        readOnly={productForm.category === 'flour'} // Si farine, le prix est déterminé par les variantes
                        placeholder={productForm.category === 'flour' ? 'Déterminé par variante' : ''}
                      />
                   </div>
                </div>

                {/* Gestion des Variantes pour les Farines */}
                {productForm.category === 'flour' && (
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2"><Scale size={14} /> Variantes (Grammage)</label>
                        <button type="button" onClick={addVariant} className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline"><PlusCircle size={12} /> Ajouter poids</button>
                    </div>
                    
                    {(!productForm.variants || productForm.variants.length === 0) && (
                        <p className="text-xs text-stone-400 italic text-center py-2">Aucune variante. Ajoutez des poids (ex: 250g).</p>
                    )}

                    <div className="space-y-2">
                        {productForm.variants?.map((variant, idx) => (
                            <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                                <input 
                                    type="text" placeholder="Poids (ex: 500g)"
                                    className="flex-1 p-2 bg-white rounded-lg border-none text-sm shadow-sm"
                                    value={variant.label}
                                    onChange={(e) => handleVariantChange(idx, 'label', e.target.value)}
                                />
                                <input 
                                    type="number" placeholder="Prix"
                                    className="w-24 p-2 bg-white rounded-lg border-none text-sm shadow-sm"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                                />
                                <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-red-400 hover:text-red-600"><XCircle size={16} /></button>
                            </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Gestion Image Produit */}
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">Image du produit</label>
                  <div className="mt-2 flex flex-col gap-3">
                    {(productImageFile || productForm.image) && (
                      <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={productImageFile ? URL.createObjectURL(productImageFile) : productForm.image} 
                          alt="Preview" className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="relative">
                       <input 
                         type="file" accept="image/*"
                         onChange={(e) => { if (e.target.files && e.target.files[0]) setProductImageFile(e.target.files[0]); }}
                         className="hidden" id="product-image-upload"
                       />
                       <label htmlFor="product-image-upload" className="flex items-center justify-center gap-2 w-full p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors text-stone-600 text-sm font-medium">
                         <Upload size={18} /> {productImageFile ? 'Changer le fichier' : 'Importer une image'}
                       </label>
                    </div>
                    <input 
                        type="text" placeholder="Ou coller une URL..."
                        className="w-full p-2 bg-transparent text-xs text-gray-400 border-b border-gray-200 focus:outline-none focus:border-emerald-500"
                        value={productForm.image || ''}
                        onChange={e => setProductForm({...productForm, image: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">Description</label>
                  <textarea 
                    required className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20 h-24"
                    value={productForm.description || ''}
                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-2">
                  {editingProductId && (
                    <button type="button" onClick={handleCancelProductEdit} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">Annuler</button>
                  )}
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-stone-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-stone-800 active:scale-95 transition-all flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingProductId ? 'Sauvegarder' : 'Ajouter le Produit')}
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des produits existants */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <h3 className="font-bold text-stone-700">Produits existants</h3>
                   <span className="text-xs text-stone-400">{products.length} produits</span>
                </div>
                {products.length === 0 && !loading && <p className="text-center text-sm text-gray-400 py-4">Aucun produit trouvé.</p>}
                {products.map(product => (
                  <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4 group">
                      <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-stone-500">
                             {product.category === 'tea' ? 'Thé' : 'Farine'} • 
                             {product.variants ? ` ${product.variants.length} formats` : ` ${product.price} F`}
                          </p>
                      </div>
                      <div className="flex items-center gap-2">
                          <button onClick={() => handleEditProduct(product)} className="p-2 bg-stone-50 text-stone-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                              <Edit2 size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteRequest('product', product.id, product.name)} 
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* --- SERVICES TAB --- */}
        {activeSubTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
              <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                {editingServiceId ? <Edit2 size={20} className="text-emerald-600" /> : <PlusCircle size={20} className="text-emerald-600" />}
                {editingServiceId ? 'Modifier le Service' : 'Ajouter un Service'}
              </h2>
              
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">Titre du service</label>
                  <input 
                    type="text" required
                    className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20"
                    value={serviceForm.title || ''}
                    onChange={e => setServiceForm({...serviceForm, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-stone-500 uppercase">Prix (FCFA)</label>
                      <input 
                        type="number" required
                        className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20"
                        value={serviceForm.price || ''}
                        onChange={e => setServiceForm({...serviceForm, price: parseFloat(e.target.value)})}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-stone-500 uppercase">Unité</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20"
                        value={serviceForm.priceUnit || ''}
                        onChange={e => setServiceForm({...serviceForm, priceUnit: e.target.value})}
                      />
                   </div>
                </div>

                {/* Gestion Image Service */}
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">Image du service</label>
                  <div className="mt-2 flex flex-col gap-3">
                    {(serviceImageFile || serviceForm.image) && (
                      <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={serviceImageFile ? URL.createObjectURL(serviceImageFile) : serviceForm.image} 
                          alt="Preview" className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="relative">
                       <input 
                         type="file" accept="image/*"
                         onChange={(e) => { if (e.target.files && e.target.files[0]) setServiceImageFile(e.target.files[0]); }}
                         className="hidden" id="service-image-upload"
                       />
                       <label htmlFor="service-image-upload" className="flex items-center justify-center gap-2 w-full p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors text-stone-600 text-sm font-medium">
                         <Upload size={18} /> {serviceImageFile ? 'Changer le fichier' : 'Importer une image'}
                       </label>
                    </div>
                    <input 
                        type="text" placeholder="Ou coller une URL..."
                        className="w-full p-2 bg-transparent text-xs text-gray-400 border-b border-gray-200 focus:outline-none focus:border-emerald-500"
                        value={serviceForm.image || ''}
                        onChange={e => setServiceForm({...serviceForm, image: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">Description</label>
                  <textarea 
                    required
                    className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20 h-24"
                    value={serviceForm.description || ''}
                    onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-2">
                  {editingServiceId && (
                    <button type="button" onClick={handleCancelServiceEdit} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">Annuler</button>
                  )}
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-stone-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-stone-800 active:scale-95 transition-all flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingServiceId ? 'Sauvegarder' : 'Ajouter le Service')}
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des services existants */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <h3 className="font-bold text-stone-700">Services existants</h3>
                   <span className="text-xs text-stone-400">{services.length} services</span>
                </div>
                {services.length === 0 && !loading && <p className="text-center text-sm text-gray-400 py-4">Aucun service trouvé.</p>}
                {services.map(service => (
                  <div key={service.id} className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4 group">
                      <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-sm truncate">{service.title}</h4>
                          <p className="text-xs text-stone-500">{service.price} F {service.priceUnit ? `/ ${service.priceUnit}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <button onClick={() => handleEditService(service)} className="p-2 bg-stone-50 text-stone-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                              <Edit2 size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteRequest('service', service.id, service.title)} 
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;