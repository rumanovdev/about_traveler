import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  vite: {
    resolve: {
      alias: { '@': '/src' },
      dedupe: ['react', 'react-dom'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@sentry')) {
              return 'vendor-analytics';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
          },
        },
      },
    },
  },
});
