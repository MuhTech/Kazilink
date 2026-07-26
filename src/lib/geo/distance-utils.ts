/**
 * Distance and Geographic Calculation Utilities for KaziLink Tanzania
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface TravelTimeEstimates {
  carMinutes: number;
  bodaMinutes: number;
  busMinutes: number;
  walkMinutes: number;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimates travel duration across common Tanzanian transport modes.
 */
export function getTravelTimeEstimates(distanceKm: number): TravelTimeEstimates {
  if (distanceKm <= 0) {
    return { carMinutes: 0, bodaMinutes: 0, busMinutes: 0, walkMinutes: 0 };
  }

  return {
    carMinutes: Math.max(1, Math.round((distanceKm / 40) * 60) + 5), // 40 km/h + traffic
    bodaMinutes: Math.max(1, Math.round((distanceKm / 35) * 60) + 2), // 35 km/h boda boda
    busMinutes: Math.max(1, Math.round((distanceKm / 22) * 60) + 10), // 22 km/h Daladala bus
    walkMinutes: Math.max(1, Math.round((distanceKm / 5) * 60)), // 5 km/h walking speed
  };
}

/**
 * Formats distance with appropriate units.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
