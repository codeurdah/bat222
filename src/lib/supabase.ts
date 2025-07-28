import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Validation des variables d'environnement
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes !');
  console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Définie' : '❌ Manquante');
  console.error('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Manquante');
  console.error('💡 Veuillez configurer ces variables dans votre fichier .env');
}

// Validation de l'URL
try {
  new URL(supabaseUrl);
  console.log('✅ URL Supabase valide:', supabaseUrl);
} catch (error) {
  console.error('❌ URL Supabase invalide:', supabaseUrl);
  console.log('💡 Veuillez configurer une URL valide dans VITE_SUPABASE_URL (ex: https://votre-projet.supabase.co)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});