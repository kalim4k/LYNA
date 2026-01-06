import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
// Si vous n'utilisez pas de variables d'environnement (.env), vous pouvez laisser vos clés ici.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://bazgpgcyxijtwvtnegwq.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rf3Fui0n3Wpcgy6Dr-esYA_hFDTLi6K';

// Initialisation directe du client
export const supabase = createClient(supabaseUrl, supabaseKey);