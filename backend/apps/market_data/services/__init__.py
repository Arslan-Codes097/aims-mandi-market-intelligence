from django.conf import settings

from .mock_service import MockMarketDataService

if getattr(settings, "USE_LIVE_MARKET_DATA", False):
    from .live_service import LiveMarketDataService

    market_data_service = LiveMarketDataService()
else:
    market_data_service = MockMarketDataService()
