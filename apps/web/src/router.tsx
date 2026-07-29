import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { initSentry } from './lib/sentry';

// Runs once at module load. No-op during SSR / dev (see initSentry).
initSentry();

export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true });
}
