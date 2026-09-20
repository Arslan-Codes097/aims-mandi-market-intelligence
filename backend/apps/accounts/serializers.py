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
        extra_kwargs = {
            "email": {"validators": []}  # Handled custom below to allow re-registering unverified accounts
        }

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        email = attrs.get("email")
        if email:
            existing = User.objects.filter(email__iexact=email).first()
            if existing:
                if existing.is_verified:
                    raise serializers.ValidationError({"email": "A user with this email already exists."})
                else:
                    # Clean up stale unverified account from earlier failed attempt
                    existing.delete()

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
    mode = serializers.ChoiceField(choices=['login', 'signup'], required=False, default='login')


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
    return {
        "access": str(refresh.access_token), 
        "refresh": str(refresh),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": user.is_verified,
            "auth_provider": user.auth_provider,
        }
    }


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(required=False, allow_blank=True)
    confirmation_text = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        user = self.context['request'].user
        if user.auth_provider == 'email':
            if not attrs.get('password'):
                raise serializers.ValidationError({'password': 'Password is required to delete your account.'})
            if not user.check_password(attrs['password']):
                raise serializers.ValidationError({'password': 'Incorrect password.'})
        elif user.auth_provider == 'google':
            if attrs.get('confirmation_text') != 'DELETE':
                raise serializers.ValidationError({'confirmation_text': 'You must type DELETE to confirm.'})
        return attrs
