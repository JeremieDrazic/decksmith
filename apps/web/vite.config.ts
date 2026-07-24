import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // Pin the dev server to 3001: the framework default (3000) collides with apps/api.
  // The API's dev CORS_ORIGIN default allows http://localhost:3001.
  server: {
    port: 3001,
  },
  plugins: [
    tanstackStart({
      tsr: {
        quoteStyle: 'single',
        semicolons: true,
      },
    }),
    react(),
    tailwindcss(),
    nitro(),
  ],
});
