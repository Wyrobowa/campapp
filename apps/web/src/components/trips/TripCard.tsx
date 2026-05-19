import { useState } from 'react';
import type { Trip } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDate, relativeDate } from '../../utils/date';

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isOwner?: boolean;
}

export function TripCard({ trip, onClick, onDuplicate, onDelete, isOwner = true }: TripCardProps) {
  const packed = trip.items.filter((i) => i.packed).length;
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">{trip.name}</h3>
        {isOwner &&
          (confirming ? (
            <div
              className="flex items-center gap-2 ml-2"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <button
                onClick={() => {
                  setConfirming(false);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 ml-2 -mr-1 -mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="text-gray-300 hover:text-forest transition-colors p-1 rounded"
                aria-label="Duplicate trip"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="5"
                    y="5"
                    width="8"
                    height="8"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M3 11V3.5A1.5 1.5 0 014.5 2H11"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirming(true);
                }}
                className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded"
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
          ))}
      </div>
      <p className="text-xs text-gray-400 mb-3">
        {formatDate(trip.date)}
        {relativeDate(trip.date) && (
          <span className="ml-1.5 text-forest/70">{relativeDate(trip.date)}</span>
        )}
      </p>
      {trip.items.length > 0 ? (
        <ProgressBar packed={packed} total={trip.items.length} />
      ) : (
        <p className="text-xs text-gray-400">No items</p>
      )}
    </div>
  );
}
