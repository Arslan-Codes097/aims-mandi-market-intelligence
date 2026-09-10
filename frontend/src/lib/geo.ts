export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    Lahore: { lat: 31.5497, lng: 74.3436 },
    Sahiwal: { lat: 30.6682, lng: 73.1114 },
    Faisalabad: { lat: 31.4504, lng: 73.135 },
    Multan: { lat: 30.1575, lng: 71.5249 },
    Sheikhupura: { lat: 31.7167, lng: 73.9856 },
    Kalurkot: { lat: 32.1667, lng: 71.2167 },
};

function toRad(deg: number) {
    return (deg * Math.PI) / 180;
}

export function distanceKm(cityA: string, cityB: string): number | null {
    const a = CITY_COORDS[cityA];
    const b = CITY_COORDS[cityB];
    if (!a || !b) return null;

    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const h =
        Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

    return Math.round(R * c);
}

function nearestCity(lat: number, lng: number): string {
    let closest = "Lahore";
    let minDist = Infinity;

    for (const [city, coord] of Object.entries(CITY_COORDS)) {
        const dLat = coord.lat - lat;
        const dLng = coord.lng - lng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDist) {
            minDist = dist;
            closest = city;
        }
    }

    return closest;
}

export function detectNearestCity(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve(nearestCity(position.coords.latitude, position.coords.longitude));
            },
            (error) => reject(error),
            { timeout: 8000 }
        );
    });
}

const FUEL_COST_PER_KM = 25; // rough Rs/km estimate for a loaded pickup, adjust as needed

export function estimateFuelCost(km: number | null): number | null {
    if (km === null) return null;
    return Math.round(km * FUEL_COST_PER_KM);
}