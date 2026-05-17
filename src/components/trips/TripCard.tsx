import type { Trip } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDate } from '../../utils/date';

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
  onDelete: () => void;
}

export function TripCard({ trip, onClick, onDelete }: TripCardProps) {
  const packed = trip.items.filter((i) => i.packed).length;

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">{trip.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-2 text-gray-300 hover:text-red-400 transition-colors p-1 -mr-1 -mt-1 rounded"
          aria-label="Delete trip"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 4h10M6 4V3h4v1M5 4v8h6V4H5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-3">{formatDate(trip.date)}</p>
      {trip.items.length > 0 ? (
        <ProgressBar packed={packed} total={trip.items.length} />
      ) : (
        <p className="text-xs text-gray-400">No items</p>
      )}
    </div>
  );
}
