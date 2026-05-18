import { useTripsStore } from '../store/trips';

export function useTrips() {
  return useTripsStore();
}
