import { distanceKm, estimateFuelCost } from "@/lib/geo";
import type { ArbitrageResponse, ArbitrageRoute } from "@/types/market";

export function deriveRoutes(data: ArbitrageResponse): ArbitrageRoute[] {
    const routes: ArbitrageRoute[] = [];

    for (const buy of data.prices_by_city) {
        for (const sell of data.prices_by_city) {
            if (buy.city === sell.city || sell.price <= buy.price) continue;

            const km = distanceKm(buy.city, sell.city);
            const fuelCost = estimateFuelCost(km);
            const grossMargin = sell.price - buy.price;

            routes.push({
                buy_city: buy.city,
                sell_city: sell.city,
                buy_price: buy.price,
                sell_price: sell.price,
                gross_margin: grossMargin,
                distance_km: km,
                fuel_cost: fuelCost,
                net_profit: fuelCost !== null ? grossMargin - fuelCost : null,
            });
        }
    }

    return routes.sort((a, b) => (b.net_profit ?? b.gross_margin) - (a.net_profit ?? a.gross_margin));
}