from django.urls import path

from .views import MyPreferencesView, WatchlistAlertsView

urlpatterns = [
    path("me/preferences/", MyPreferencesView.as_view(), name="my-preferences"),
    path("me/alerts/", WatchlistAlertsView.as_view(), name="watchlist-alerts"),
]
