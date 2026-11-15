import { createFileRoute, redirect, useLoaderData, useRouteContext } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { AppShell } from '../components/shell/AppShell';
import {
  FOLDED_COOKIE,
  parseFoldedFromCookieString,
  parseWideFromCookieString,
  TRUE_COOKIE_VALUE,
  WIDE_COOKIE,
} from '../components/shell/shell-cookie';
import { $getMe } from '../lib/auth/get-me';

// Reads the shell preferences server-side to seed the first paint with the right
// frame. Mirrors the root loader's theme/language pattern.
const $getServerWide = createServerFn({ method: 'GET' }).handler(async () => {
  const { getCookie } = await import('@tanstack/react-start/server');
  return getCookie(WIDE_COOKIE) === TRUE_COOKIE_VALUE;
});

const $getServerFolded = createServerFn({ method: 'GET' }).handler(async () => {
  const { getCookie } = await import('@tanstack/react-start/server');
  return getCookie(FOLDED_COOKIE) === TRUE_COOKIE_VALUE;
});

function getClientWide(): boolean {
  return parseWideFromCookieString(document.cookie);
}

function getClientFolded(): boolean {
  return parseFoldedFromCookieString(document.cookie);
}

function AuthenticatedLayout() {
  const { wide, folded } = useLoaderData({ from: '/_authenticated' });
  const { user } = useRouteContext({ from: '/_authenticated' });
  return <AppShell initialWide={wide} initialFolded={folded} user={user} />;
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await $getMe();
    if (!user) throw redirect({ to: '/login', search: { redirectTo: location.pathname } });
    return { user };
  },
  loader: async () => {
    const onServer = globalThis.window === undefined;
    const wide = onServer ? await $getServerWide() : getClientWide();
    const folded = onServer ? await $getServerFolded() : getClientFolded();
    return { wide, folded };
  },
  component: AuthenticatedLayout,
});
