import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

import { $getMe } from '../lib/auth/get-me';

function AuthenticatedLayout() {
  return <Outlet />;
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await $getMe();
    if (!user) throw redirect({ to: '/login', search: { redirectTo: location.pathname } });
    return { user };
  },
  component: AuthenticatedLayout,
});
