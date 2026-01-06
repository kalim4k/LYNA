import React, { useEffect, useState } from 'react';
import { UserCircle, Settings, LogOut, ChevronRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { UserProfile, Tab } from '../types';
import AuthView from './AuthView';
import LoadingScreen from './LoadingScreen';

interface ProfileViewProps {
  session: Session | null;
  onNavigateToAdmin?: () => void; // New prop to handle navigation
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, onNavigateToAdmin }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user && supabase) {
      getProfile(session.user.id);
    }
  }, [session]);

  const getProfile = async (userId: string) => {
    setLoading(true);
    // Petite pause pour l'animation
    await new Promise(r => setTimeout(r, 600));

    try {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn("Profil introuvable, utilisation des données de session");
      }

      setProfile(data || {
        id: userId,
        full_name: session?.user.user_metadata?.full_name || 'Utilisateur',
        email: session?.user.email || '',
        phone: session?.user.phone || '',
        role: 'user'
      });
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  // Si pas de session, on affiche l'écran de connexion
  if (!session) {
    return <AuthView />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="px-4 py-6 space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profil */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg shadow-emerald-100">
            <UserCircle size={64} className="text-emerald-300" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">{profile?.full_name || 'Membre LYNA'}</h2>
        
        {profile?.role === 'admin' ? (
             <span className="bg-stone-900 text-white text-[10px] font-bold px-3 py-1 rounded-full mt-2 uppercase tracking-wide flex items-center gap-1">
                 <ShieldCheck size={12} /> Administrateur
             </span>
        ) : (
             <p className="text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1 rounded-full mt-2">
                Client Vérifié
             </p>
        )}
      </div>

      {/* ADMIN ACTION - Only if Admin */}
      {profile?.role === 'admin' && (
        <button 
            onClick={onNavigateToAdmin}
            className="w-full bg-gradient-to-r from-stone-800 to-stone-900 text-white p-4 rounded-2xl shadow-lg shadow-stone-200 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
            <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-xl"><ShieldCheck size={20} className="text-emerald-400" /></div>
                <div className="text-left">
                    <span className="block font-bold text-sm">Portail Administration</span>
                    <span className="text-xs text-stone-400">Gérer produits & commandes</span>
                </div>
            </div>
            <ChevronRight className="text-stone-500 group-hover:text-white transition-colors" />
        </button>
      )}

      {/* Informations Personnelles Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 space-y-4">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Mes Informations</h3>
        
        <div className="flex items-center gap-4 py-1">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Mail size={16} />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium">Email</p>
                <p className="text-sm font-medium text-gray-800">{profile?.email || session.user.email}</p>
            </div>
        </div>

        <div className="flex items-center gap-4 py-1">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Phone size={16} />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium">Téléphone</p>
                <p className="text-sm font-medium text-gray-800">{profile?.phone || 'Non renseigné'}</p>
            </div>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-2">Compte</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors border-b border-stone-50 group">
                <div className="flex items-center gap-3">
                    <div className="bg-stone-100 group-hover:bg-emerald-100 group-hover:text-emerald-600 p-2 rounded-lg text-stone-600 transition-colors"><Settings size={18} /></div>
                    <span className="font-medium text-sm text-stone-700">Modifier mon profil</span>
                </div>
                <ChevronRight size={16} className="text-stone-300" />
            </button>
            <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-red-50 group-hover:bg-red-100 p-2 rounded-lg text-red-500 transition-colors"><LogOut size={18} /></div>
                    <span className="font-medium text-sm text-red-600">Se déconnecter</span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;