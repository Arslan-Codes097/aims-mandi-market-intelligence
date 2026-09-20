from datetime import datetime
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.market_data.services import market_data_service
from .models import UserPreference
from .serializers import UserPreferenceSerializer


class MyPreferencesView(RetrieveUpdateAPIView):
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        preference, _ = UserPreference.objects.get_or_create(user=self.request.user)
        return preference


class WatchlistAlertsView(APIView):
    """
    Computes intelligent, real-time price alerts on commodities in the user's watchlist.
    Flags significant price spikes (> +2.5%) or price drops (< -2.5%).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        preference, _ = UserPreference.objects.get_or_create(user=request.user)
        watchlist = preference.watchlist or preference.preferred_commodities
        if not watchlist:
            watchlist = ["tomato", "potato", "onion"]

        city = preference.home_city or "Lahore"
        alerts = []

        for item in watchlist:
            comm_name = str(item).strip().lower()
            try:
                trend = market_data_service.get_trend(comm_name, city, days=7)
                pct_change = trend.get("pct_change", 0.0)
                data_points = trend.get("data_points", [])

                if data_points:
                    current_price = data_points[-1]["price"]
                    prev_price = (
                        data_points[-2]["price"]
                        if len(data_points) > 1
                        else current_price
                    )
                    date_str = data_points[-1]["date"]
                else:
                    current_price = 0.0
                    prev_price = 0.0
                    date_str = datetime.now().strftime("%Y-%m-%d")

                # Trigger alert on significant change
                if abs(pct_change) >= 2.5:
                    direction = "spike" if pct_change > 0 else "dip"
                    sign = "+" if pct_change > 0 else ""
                    cap_comm = comm_name.capitalize()

                    if direction == "spike":
                        title = f"{cap_comm} surged {sign}{pct_change:.1f}% in {city}"
                        message = f"Current mandi rate jumped to PKR {current_price:.0f}/kg (was PKR {prev_price:.0f}/kg). Prime selling opportunity!"
                    else:
                        title = f"{cap_comm} dropped {sign}{pct_change:.1f}% in {city}"
                        message = f"Current mandi rate dropped to PKR {current_price:.0f}/kg (was PKR {prev_price:.0f}/kg). Consider holding or buying."

                    alerts.append(
                        {
                            "id": f"alert-{comm_name}-{date_str}-{direction}",
                            "commodity": cap_comm,
                            "slug": comm_name,
                            "city": city,
                            "change_pct": round(pct_change, 1),
                            "direction": direction,
                            "current_price": current_price,
                            "previous_price": prev_price,
                            "title": title,
                            "message": message,
                            "severity": "high" if abs(pct_change) >= 8.0 else "medium",
                            "date": date_str,
                            "created_at": datetime.now().isoformat(),
                        }
                    )
            except Exception:
                continue

        # Sort alerts by highest percentage move
        alerts.sort(key=lambda x: abs(x["change_pct"]), reverse=True)

        return Response(
            {
                "alerts": alerts,
                "unread_count": len(alerts),
                "watchlist": watchlist,
                "home_city": city,
            }
        )
