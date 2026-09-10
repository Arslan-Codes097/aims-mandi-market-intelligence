from abc import ABC, abstractmethod


class MarketDataService(ABC):
    @abstractmethod
    def get_trend(self, commodity: str, city: str, days: int) -> dict: ...

    @abstractmethod
    def get_anomaly(self, commodity: str, city: str, date: str) -> dict: ...

    @abstractmethod
    def get_arbitrage(self, commodity: str) -> dict: ...

    @abstractmethod
    def get_advisory(self, commodity: str, city: str) -> dict: ...

    @abstractmethod
    def get_commodities(self) -> list[str]: ...

    @abstractmethod
    def get_cities(self) -> list[str]: ...
