from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


from apps.profiles.models import UserPreference

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    home_city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    occupation = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    preferred_commodities = serializers.ListField(child=serializers.CharField(), required=False)
    watchlist = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = User
        fields = ["email", "password", "confirm_password", "full_name", "home_city", "occupation", "preferred_commodities", "watchlist"]

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        home_city = validated_data.pop("home_city", None)
        occupation = validated_data.pop("occupation", None)
        preferred_commodities = validated_data.pop("preferred_commodities", [])
        watchlist = validated_data.pop("watchlist", [])
        validated_data.pop("confirm_password", None)
        
        user = User.objects.create_user(**validated_data)
        
        UserPreference.objects.create(
            user=user,
            home_city=home_city,
            occupation=occupation,
            preferred_commodities=preferred_commodities,
            watchlist=watchlist
        )
        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_verified:
            raise serializers.ValidationError(
                "Please verify your email before logging in."
            )

        attrs["user"] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


def issue_tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}
