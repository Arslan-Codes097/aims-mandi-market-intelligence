from rest_framework import serializers

from .models import UserPreference


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            "home_city",
            "occupation",
            "preferred_commodities",
            "watchlist",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
