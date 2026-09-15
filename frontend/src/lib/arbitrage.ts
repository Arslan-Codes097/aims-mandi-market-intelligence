import { distanceKm } from "@/lib/geo";
import type { ArbitrageResponse, ArbitrageRoute } from "@/types/market";

export function deriveRoutes(data: ArbitrageResponse, currentLocation: string | null = null, payloadKg: number = 1000): ArbitrageRoute[] {
    const routes: ArbitrageRoute[] = [];

    // Fallback to 403.32 if backend doesn't provide it
    const liveDieselPrice = data.diesel_price ?? 403.32;
    // Assume a commercial truck gives ~5 km per liter
    const KM_PER_LITER = 5;

    for (const buy of data.prices_by_city) {
        for (const sell of data.prices_by_city) {
            // Prices are already per-KG from the backend
            const buyPriceKg = Math.round(buy.price);
            const sellPriceKg = Math.round(sell.price);

            if (buy.city === sell.city || sellPriceKg <= buyPriceKg) continue;

            const kmToBuy = currentLocation ? (distanceKm(currentLocation, buy.city) || 0) : 0;
            const kmBuyToSell = distanceKm(buy.city, sell.city) || 0;
            const totalKm = kmToBuy + kmBuyToSell;

            // Total trip fuel cost = (distance / km_per_liter) * diesel_price
            const totalFuelCost = Math.round((totalKm / KM_PER_LITER) * liveDieselPrice);
            
            const grossMarginKg = sellPriceKg - buyPriceKg;
            const totalGrossProfit = grossMarginKg * payloadKg;
            const totalNetProfit = totalGrossProfit - totalFuelCost;

            routes.push({
                buy_city: buy.city,
                sell_city: sell.city,
                buy_price: buyPriceKg,
                sell_price: sellPriceKg,
                gross_margin: grossMarginKg,
                distance_km: totalKm,
                fuel_cost: totalFuelCost,
                net_profit: null,
                total_net_profit: totalNetProfit,
            });
        }
    }

    // Sort by true total net profit
    return routes.sort((a, b) => (b.total_net_profit ?? b.gross_margin) - (a.total_net_profit ?? a.gross_margin));
}