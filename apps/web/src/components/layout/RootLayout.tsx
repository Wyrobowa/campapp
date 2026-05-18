import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { authClient } from '../../lib/auth-client';
import { Login } from '../../pages/Login';

function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tripsActive = pathname === '/' || pathname.startsWith('/trips');
  const templatesActive = pathname.startsWith('/templates');

  const active = 'text-forest';
  const inactive = 'text-gray-400';

  const handleSignOut = async () => {
    await authClient.signOut();
    void navigate({ to: '/login' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
      <Link
        to="/"
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${tripsActive ? active : inactive}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Trips
      </Link>
      <Link
        to="/templates"
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${templatesActive ? active : inactive}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Templates
      </Link>
      <button
        onClick={() => {
          void handleSignOut();
        }}
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${inactive}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
          <path
            d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4M9 14l4-4-4-4M3 10h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Sign out
      </button>
    </nav>
  );
}

export function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Outlet />
      <NavBar />
      <div className="h-16" />
    </div>
  );
}
