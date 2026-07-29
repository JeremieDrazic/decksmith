import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const sentryAuthToken = process.env['SENTRY_AUTH_TOKEN'];

export default defineConfig({
  // Pin the dev server to 3001: the framework default (3000) collides with apps/api.
  // The API's dev CORS_ORIGIN default allows http://localhost:3001.
  server: {
    port: 3001,
  },
  // Emit hidden source maps (no //# sourceMappingURL comment in the shipped JS): the
  // plugin uploads them to GlitchTip, then deletes the .map files, so they're never
  // served publicly. Un-minified stacks appear in GlitchTip, not in the browser.
  build: {
    sourcemap: 'hidden',
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
    // Must be last. No-op unless SENTRY_AUTH_TOKEN is present (i.e. CI prod builds),
    // so local dev builds skip the upload entirely. org/project are non-sensitive;
    // url (the monitoring domain) and the token come from CI secrets. Release name
    // matches VITE_APP_VERSION, the same value Sentry.init reports at runtime.
    sentryVitePlugin({
      disable: !sentryAuthToken,
      authToken: sentryAuthToken,
      url: process.env['SENTRY_URL'],
      org: 'jerem',
      project: 'decksmith-web',
      release: { name: process.env['VITE_APP_VERSION'] },
      sourcemaps: {
        filesToDeleteAfterUpload: ['**/*.map'],
      },
    }),
  ],
});
