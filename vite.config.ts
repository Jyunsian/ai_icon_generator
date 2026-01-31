import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Use localhost instead of 0.0.0.0 for security in development
    host: 'localhost',
    // Allow ngrok and other tunnel services
    allowedHosts: 'all',
    // Proxy API requests to local Express server during development
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Generate source maps for production debugging
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Environment variable handling - only expose safe variables
  // NEVER expose API keys to the client bundle
  define: {
    // Add any safe environment variables here
    'import.meta.env.APP_VERSION': JSON.stringify('1.2'),
  },
});
