from rest_framework import serializers


class TrendQuerySerializer(serializers.Serializer):
    commodity = serializers.CharField()
    city = serializers.CharField()
    days = serializers.IntegerField(min_value=1, max_value=90, default=7)


class AnomalyQuerySerializer(serializers.Serializer):
    commodity = serializers.CharField()
    city = serializers.CharField()
    date = serializers.DateField()


class ArbitrageQuerySerializer(serializers.Serializer):
    commodity = serializers.CharField()


class AdvisoryQuerySerializer(serializers.Serializer):
    commodity = serializers.CharField()
    city = serializers.CharField()
