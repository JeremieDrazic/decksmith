import { Outlet, createFileRoute } from '@tanstack/react-router';

function AuthLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});
