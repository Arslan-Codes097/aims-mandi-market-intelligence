from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    AdvisoryQuerySerializer,
    AnomalyQuerySerializer,
    ArbitrageQuerySerializer,
    TrendQuerySerializer,
)
from .services import market_data_service


class TrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = TrendQuerySerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        return Response(market_data_service.get_trend(**params.validated_data))


class AnomalyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = AnomalyQuerySerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        validated = params.validated_data
        data = market_data_service.get_anomaly(
            commodity=validated["commodity"],
            city=validated["city"],
            date=str(validated["date"]),
        )
        return Response(data)


class ArbitrageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = ArbitrageQuerySerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        return Response(market_data_service.get_arbitrage(**params.validated_data))


class AdvisoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = AdvisoryQuerySerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        return Response(market_data_service.get_advisory(**params.validated_data))


class CommodityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"commodities": market_data_service.get_commodities()})


class CityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"cities": market_data_service.get_cities()})
