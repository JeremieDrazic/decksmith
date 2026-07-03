import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { Logo, Mark } from '@decksmith/web-ui';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <Link
        to="/"
        className="mb-8 flex flex-col items-center gap-3 rounded-interactive outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Mark size="lg" animate="glow" />
        <Logo variant="wordmark" size="lg" />
      </Link>
      <div className="w-full max-w-sm md:bg-surface md:border md:border-border md:rounded-surface md:shadow-card md:p-8">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});
