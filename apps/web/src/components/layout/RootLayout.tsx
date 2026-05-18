import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { authClient } from '../../lib/auth-client';
import { Login } from '../../pages/Login';

function useSlowLoad(isLoading: boolean, delayMs = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => {
      setSlow(true);
    }, delayMs);
    return () => {
      clearTimeout(t);
      setSlow(false);
    };
  }, [isLoading, delayMs]);
  return slow;
}

function NavBar() {
  const { pathname } = useLocation();
  const tripsActive = pathname === '/' || pathname.startsWith('/trips');
  const templatesActive = pathname.startsWith('/templates');
  const accountActive = pathname.startsWith('/account');

  const active = 'text-forest';
  const inactive = 'text-gray-400';

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
      <Link
        to="/account"
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${accountActive ? active : inactive}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Account
      </Link>
    </nav>
  );
}

export function RootLayout() {
  const { pathname } = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const slow = useSlowLoad(isPending);

  if (pathname.startsWith('/share/')) {
    return <Outlet />;
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-400">Loading…</p>
          {slow && <p className="text-xs text-amber-500 mt-2">Server is waking up, please wait…</p>}
        </div>
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
