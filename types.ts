export interface ProductVariant {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number; // Base price or single price
  category: 'tea' | 'flour' | 'service';
  description: string;
  variants?: ProductVariant[]; // Optional, for flours with weights
}

export interface Service {
  id: string;
  title: string;
  price: number;
  priceUnit?: string; // e.g., "par trimestre", "par séance"
  description: string;
  icon?: string;
  image: string;
}

export interface OrderItem {
  id: string;
  user_id?: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  totalPrice: number;
  date: string;
  status?: 'pending' | 'completed' | 'cancelled';
  customerName?: string; // Optional for admin view
  customerPhone?: string; // Optional for admin view
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role?: 'user' | 'admin';
}

export enum Tab {
  BOUTIQUE = 'boutique',
  COMMANDES = 'commandes',
  PROFIL = 'profil',
  CONTACT = 'contact',
  ADMIN = 'admin',
}