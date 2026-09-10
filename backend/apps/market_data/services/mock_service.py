import random
from datetime import date, timedelta

from .base import MarketDataService


class MockMarketDataService(MarketDataService):
    def get_trend(self, commodity, city, days):
        today = date.today()
        data_points = [
            {
                "date": str(today - timedelta(days=offset)),
                "price": 100 + random.randint(-10, 10),
            }
            for offset in range(days, 0, -1)
        ]
        pct_change = round(random.uniform(-15, 15), 1)
        direction = (
            "rising" if pct_change > 2 else "falling" if pct_change < -2 else "stable"
        )
        return {
            "direction": direction,
            "pct_change": pct_change,
            "data_points": data_points,
        }

    def get_anomaly(self, commodity, city, date):
        return {
            "is_anomaly": True,
            "z_score": 2.8,
            "expected_range": {"min_expected": 85, "max_expected": 115},
            "actual_price": 140,
        }

    def get_arbitrage(self, commodity):
        prices_by_city = [
            {"city": "Sahiwal", "price": 60},
            {"city": "Faisalabad", "price": 85},
            {"city": "Lahore", "price": 105},
        ]
        cheapest = min(prices_by_city, key=lambda entry: entry["price"])
        priciest = max(prices_by_city, key=lambda entry: entry["price"])
        return {
            "best_buy_city": cheapest["city"],
            "best_sell_city": priciest["city"],
            "margin": priciest["price"] - cheapest["price"],
            "prices_by_city": prices_by_city,
        }

    def get_advisory(self, commodity, city):
        return {
            "recommendation": "sell",
            "reasoning": "Price has risen 15% in 3 days and is currently above the expected range.",
            "confidence": "high",
        }

    def get_commodities(self):
        return ["Tomato", "Onion", "Potato", "Wheat", "Rice", "Maize"]

    def get_cities(self):
        return ["Lahore", "Sahiwal", "Faisalabad", "Multan", "Kalurkot", "Sheikhupura"]
