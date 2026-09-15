export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    "BahawalPur": { lat: 29.403, lng: 71.6523 },
    "Chichawatni": { lat: 30.5317, lng: 72.6914 },
    "Chistian": { lat: 29.9087, lng: 73.0518 },
    "Faisalabad": { lat: 31.4221, lng: 73.0923 },
    "GujarKhan": { lat: 33.2345, lng: 73.1757 },
    "Gujranwala": { lat: 32.1525, lng: 74.1934 },
    "Gujrat": { lat: 32.5628, lng: 74.0645 },
    "Jaranwala": { lat: 31.333, lng: 73.4183 },
    "Lahore": { lat: 31.5657, lng: 74.3142 },
    "Layyah": { lat: 30.9681, lng: 70.9434 },
    "Lodhran": { lat: 29.539, lng: 71.6344 },
    "Mailsi": { lat: 29.8073, lng: 72.1769 },
    "Multan": { lat: 30.1978, lng: 71.472 },
    "Okara": { lat: 30.8091, lng: 73.4493 },
    "PakPattan": { lat: 30.355, lng: 73.3951 },
    "Patoki": { lat: 31.0212, lng: 73.8530 }, 
    "RahimYarKhan": { lat: 28.4238, lng: 70.2907 },
    "Rawalpindi": { lat: 33.5915, lng: 73.0537 },
    "Sahiwal": { lat: 30.6715, lng: 73.1111 },
    "Sargodha": { lat: 32.0837, lng: 72.6765 },
    "Vehari": { lat: 30.0449, lng: 72.3501 },
    "Kahrorpacca": { lat: 29.6231, lng: 71.9168 },
    "TTSingh": { lat: 30.9709, lng: 72.4826 },
    "Kalurkot": { lat: 32.1667, lng: 71.2167 },
    "Hazro": { lat: 33.9108, lng: 72.4947 },
    "Sanglahill": { lat: 31.5833, lng: 73.3833 },
    "Bhalwal": { lat: 32.2711, lng: 72.8966 },
    "Chakwal": { lat: 32.9328, lng: 72.863 },
    "Hafizabad": { lat: 32.0719, lng: 73.6885 },
    "Jahanian": { lat: 30.0423, lng: 71.8128 },
    "JamPur": { lat: 29.6384, lng: 70.5772 },
    "Jhang": { lat: 31.2729, lng: 72.3103 },
    "Kamalia": { lat: 30.727, lng: 72.645 },
    "Khudian": { lat: 31.0883, lng: 73.8138 },
    "Mamunkanjan": { lat: 30.813, lng: 72.8093 },
    "Narowal": { lat: 32.101, lng: 74.8722 },
    "Pinanwal": { lat: 32.658, lng: 73.2783 },
    "PirMahal": { lat: 30.7655, lng: 72.4344 },
    "Sambrial": { lat: 32.4756, lng: 74.3529 },
    "Sheikhupura": { lat: 31.7085, lng: 73.9864 },
    "Sialkot": { lat: 32.4945, lng: 74.5416 },
    "AhmadPurEast": { lat: 29.1431, lng: 71.2588 },
    "ChackJhumra": { lat: 31.5681, lng: 73.1818 },
    "DGKHAN": { lat: 30.0489, lng: 70.6455 },
    "Hasanabdal": { lat: 33.8195, lng: 72.6890 },
    "RenalaKhurd": { lat: 30.8778, lng: 73.5989 },
    "Sraialamgir": { lat: 32.8953, lng: 73.7570 },
    "Summandri": { lat: 31.0638, lng: 72.9599 },
    "Taunsasharif": { lat: 30.7042, lng: 70.6508 },
    "kotmoman": { lat: 32.1895, lng: 73.0289 },
};

function toRad(deg: number) {
    return (deg * Math.PI) / 180;
}

export function distanceKm(cityA: string, cityB: string): number | null {
    const keyA = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === cityA.trim().toLowerCase());
    const keyB = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === cityB.trim().toLowerCase());
    
    const a = keyA ? CITY_COORDS[keyA] : undefined;
    const b = keyB ? CITY_COORDS[keyB] : undefined;
    
    if (!a || !b) return 150; // Fallback estimate if coords missing

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