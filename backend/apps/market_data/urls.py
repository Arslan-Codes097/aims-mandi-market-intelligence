from django.urls import path

from . import views

urlpatterns = [
    path("trend/", views.TrendView.as_view(), name="trend"),
    path("anomaly/", views.AnomalyView.as_view(), name="anomaly"),
    path("arbitrage/", views.ArbitrageView.as_view(), name="arbitrage"),
    path("advisory/", views.AdvisoryView.as_view(), name="advisory"),
    path("commodities/", views.CommodityListView.as_view(), name="commodities"),
    path("cities/", views.CityListView.as_view(), name="cities"),
]
