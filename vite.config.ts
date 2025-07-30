// Dans vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'; // Vous pouvez laisser cette ligne, elle n'est pas problématique.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Conservez les logs de débogage existants pour l'instant
  console.log('Vite Config Debug: NODE_ENV:', process.env.NODE_ENV);
  console.log('Vite Config Debug: VITE_APP_ENV:', process.env.VITE_APP_ENV);
  console.log('Vite Config Debug: VITE_SUPABASE_URL (from process.env):', process.env.VITE_SUPABASE_URL);
  console.log('Vite Config Debug: VITE_SUPABASE_ANON_KEY (from process.env):', process.env.VITE_SUPABASE_ANON_KEY ? 'Key is present' : 'Key is missing');

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
            utils: ['./src/utils/calculations', './src/utils/ribGenerator'],
            components: [
              './src/components/Dashboard/AdminDashboard',
              './src/components/Dashboard/ClientDashboard',
              './src/components/Admin/ClientManagement',
              './src/components/Admin/LoanValidation',
              './src/components/Admin/TransferValidation'
            ],
          },
        },
      },
      chunkSizeWarningLimit: 1500,
      assetsInlineLimit: 4096,
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
    },
    preview: {
      port: 4173,
      host: true,
      strictPort: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js'],
      exclude: ['lucide-react'],
    },
    define: {
      // Définitions existantes
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __COMMIT_HASH__: JSON.stringify(process.env.COMMIT_HASH || 'unknown'),
      // NOUVEAU : Définir explicitement les variables d'environnement Supabase pour le client
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
      // Corriger VITE_APP_ENV s'il est undefined
      'import.meta.env.VITE_APP_ENV': JSON.stringify(process.env.VITE_APP_ENV || 'production'),
    },
    esbuild: {
      legalComments: 'none',
    },
  };
});
