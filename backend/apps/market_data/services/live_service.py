from functools import lru_cache
from intelligence import MarketIntelligence

from .base import MarketDataService

_intel = MarketIntelligence()


def _to_price_points(records):
    return [{"date": r["date"], "price": r["fqp"]} for r in records]


def _to_price_by_city(records):
    return [{"city": r["city"], "price": r["fqp"]} for r in records]


class LiveMarketDataService(MarketDataService):
    def get_trend(self, commodity, city, days):
        result = _intel.get_trend(commodity, city, days=days)
        return {
            "direction": result["direction"],
            "pct_change": result["pct_change"],
            "data_points": _to_price_points(result["data_points"]),
        }

    def get_anomaly(self, commodity, city, date):
        return _intel.get_anomaly(commodity, city, date_str=date)

    def get_arbitrage(self, commodity, distance_km=None):
        result = _intel.get_arbitrage(commodity, distance_km=distance_km)
        return {
            "best_buy_city": result["best_buy_city"],
            "best_sell_city": result["best_sell_city"],
            "margin": result["gross_margin"],
            "net_margin": result.get("net_margin"),
            "travel_cost": result.get("travel_cost"),
            "diesel_price": result.get("diesel_price"),
            "prices_by_city": _to_price_by_city(result["prices_by_city"]),
        }

    def get_advisory(self, commodity, city):
        result = _intel.get_advisory(commodity, city)
        recommendation = (
            "hold"
            if result["recommendation"] == "buy/hold"
            else result["recommendation"]
        )
        return {**result, "recommendation": recommendation}

    @lru_cache(maxsize=1)
    def get_commodities(self):
        response = _intel.supabase.table("prices").select("commodity").limit(50000).execute()
        values = {row["commodity"] for row in response.data if row.get("commodity")}
        return sorted(values)

    @lru_cache(maxsize=1)
    def get_cities(self):
        response = _intel.supabase.table("prices").select("city").limit(50000).execute()
        values = {row["city"] for row in response.data if row.get("city")}
        return sorted(values)
