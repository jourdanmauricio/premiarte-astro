// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from '@astrojs/node';
import clerk from '@clerk/astro';
import { dark } from '@clerk/themes';
import { esES } from '@clerk/localizations';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
            ],
          },
        },
      },
    },
  },
  integrations: [
    react(),
    clerk({
      localization: esES,
      appearance: {
        baseTheme: dark,
      },
    }),
    // db(),
  ],
  adapter: node({
    mode: 'standalone',
  }),
  output: 'server',
  db: {
    // Para desarrollo local con SQLite persistente
    forceReset: false, // Evita el reseteo automático
    file: './local-database.db',
  },
});
