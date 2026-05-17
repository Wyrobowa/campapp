import { useState } from 'react';
import type { Trip } from './types';
import { Home } from './pages/Home';
import { TripDetail } from './pages/TripDetail';
import { Templates } from './pages/Templates';

type Page = 'home' | 'trip' | 'templates';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  function openTrip(trip: Trip) {
    setSelectedTrip(trip);
    setPage('trip');
  }

  function goHome() {
    setPage('home');
    setSelectedTrip(null);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {page === 'home' && <Home onSelectTrip={openTrip} />}
      {page === 'trip' && selectedTrip && <TripDetail trip={selectedTrip} onBack={goHome} />}
      {page === 'templates' && <Templates />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        <button
          onClick={goHome}
          className={`flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${
            page === 'home' || page === 'trip' ? 'text-[#2D5016]' : 'text-gray-400'
          }`}
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
        </button>
        <button
          onClick={() => {
            setPage('templates');
          }}
          className={`flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${
            page === 'templates' ? 'text-[#2D5016]' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect
              x="11"
              y="3"
              width="6"
              height="6"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect
              x="3"
              y="11"
              width="6"
              height="6"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect
              x="11"
              y="11"
              width="6"
              height="6"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          Templates
        </button>
      </nav>

      <div className="h-16" />
    </div>
  );
}
