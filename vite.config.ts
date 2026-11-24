import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 3000,
    // Same-origin in development, so the backend needs no CORS entry for it.
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Framework code changes rarely, so keep it cacheable across releases.
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', '@reduxjs/toolkit/query/react', 'react-redux'],
        },
      },
    },
  },
  test: {
    globals: true,
    testTimeout: 20_000,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    env: {
      // Node's fetch cannot resolve relative URLs.
      VITE_API_BASE_URL: 'http://localhost/api',
    },
  },
});
