import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tanstackStart({
      tsr: {
        quoteStyle: 'single',
        semicolons: true,
      },
    }),
    tailwindcss(),
  ],
});
