import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { OrderItem, Product, Service, UserProfile } from '../types';
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
  AlertCircle
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
  
  // Form States - Products
  const [productForm, setProductForm] = useState<Partial<Product>>({ category: 'tea', price: 0, name: '', description: '', image: '' });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Form States - Services
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({ price: 0, title: '', description: '', image: '', priceUnit: '' });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setErrorMsg("Erreur chargement commandes: " + (err.message || "Erreur inconnue"));
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
          setProducts(data.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')) as Product[]);
      }
    } catch (err: any) { 
        console.error("Erreur produits:", err.message || err);
        setErrorMsg("Erreur chargement produits. Vérifiez que la table 'products' existe.");
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
        setErrorMsg("Erreur chargement services. Vérifiez que la table 'services' existe.");
    } finally { setLoading(false); }
  };

  // --- ACTIONS ---

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Tentative de upload
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
            upsert: false
        });

      if (uploadError) {
        // Gestion spécifique de l'erreur "Bucket not found"
        if (uploadError.message.includes('Bucket not found') || (uploadError as any).error === 'Bucket not found') {
             alert(
                "ERREUR : Le bucket 'product-images' n'existe pas dans votre projet Supabase.\n\n" +
                "SOLUTION :\n" +
                "1. Allez sur votre dashboard Supabase > Storage\n" +
                "2. Cliquez sur 'New Bucket'\n" +
                "3. Nommez-le 'product-images'\n" +
                "4. Activez 'Public bucket'\n" +
                "5. Sauvegardez."
             );
             throw new Error("Bucket 'product-images' manquant.");
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Erreur upload image:', error.message || error);
      if (!error.message.includes("Bucket 'product-images' manquant")) {
          alert("Erreur lors de l'upload : " + (error.message || "Erreur inconnue"));
      }
      return null;
    }
  };

  // --- HANDLERS PRODUCTS ---

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!supabase) return;

    try {
      let imageUrl = productForm.image;
      if (productImageFile) {
        const uploadedUrl = await uploadImage(productImageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
        else {
             setIsSubmitting(false);
             return; // Stop si upload échoue
        }
      }

      const productData = { ...productForm, image: imageUrl };

      if (editingProductId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProductId);
        if (error) throw error;
        alert("Produit modifié !");
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        alert("Produit ajouté !");
      }
      handleCancelProductEdit();
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      alert("Erreur: " + (error.message || "Erreur inconnue"));
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
    setProductForm({ category: 'tea', price: 0, name: '', description: '', image: '' });
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
      
      // Upload spécifique pour les services
      if (serviceImageFile) {
         const uploadedUrl = await uploadImage(serviceImageFile);
         if (uploadedUrl) imageUrl = uploadedUrl;
         else {
             setIsSubmitting(false);
             return; 
        }
      }

      const serviceDataDB = {
          title: serviceForm.title,
          price: serviceForm.price,
          price_unit: serviceForm.priceUnit,
          description: serviceForm.description,
          image: imageUrl
      };

      if (editingServiceId) {
        const { error } = await supabase.from('services').update(serviceDataDB).eq('id', editingServiceId);
        if (error) throw error;
        alert("Service modifié !");
      } else {
        const { error } = await supabase.from('services').insert([serviceDataDB]);
        if (error) throw error;
        alert("Service ajouté !");
      }
      handleCancelServiceEdit();
      fetchServices();
    } catch (error: any) {
       console.error(error);
       alert("Erreur: " + (error.message || "Erreur inconnue"));
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
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'user' } : u));
    await supabase.from('app_users').update({ role: newRole }).eq('id', userId);
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'completed' | 'cancelled') => {
    if (!supabase) return;
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 animate-in fade-in duration-500">
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
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-0.5">{order.date}</p>
                          <h3 className="font-bold text-stone-900">{order.customerName}</h3>
                          {order.customerPhone && <p className="text-xs text-stone-500">{order.customerPhone}</p>}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status === 'pending' ? 'En attente' : order.status === 'completed' ? 'Livré' : 'Annulé'}</span>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl mb-3">
                        <p className="font-medium text-sm text-stone-800">{order.productName}</p>
                        <div className="flex justify-between text-xs mt-1 text-stone-500">
                          <span>{order.variantLabel ? `Format: ${order.variantLabel}` : 'Standard'} x {order.quantity}</span>
                          <span className="font-bold text-stone-900">{order.totalPrice.toLocaleString()} F</span>
                        </div>
                      </div>
                      {order.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => updateOrderStatus(order.id, 'completed')} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-700"><CheckCircle size={14} /> Valider</button>
                          <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-100"><XCircle size={14} /> Refuser</button>
                        </div>
                      )}
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
                      <label className="text-xs font-bold text-stone-500 uppercase">Prix (FCFA)</label>
                      <input 
                        type="number" required
                        className="w-full mt-1 p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20"
                        value={productForm.price || ''}
                        onChange={e => setProductForm({...productForm, price: parseInt(e.target.value)})}
                      />
                   </div>
                </div>

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
                          <p className="text-xs text-stone-500">{product.category === 'tea' ? 'Thé' : 'Farine'} • {product.price} F</p>
                      </div>
                      <button onClick={() => handleEditProduct(product)} className="p-2 bg-stone-50 text-stone-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <Edit2 size={18} />
                      </button>
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
                        onChange={e => setServiceForm({...serviceForm, price: parseInt(e.target.value)})}
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
                      <button onClick={() => handleEditService(service)} className="p-2 bg-stone-50 text-stone-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <Edit2 size={18} />
                      </button>
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