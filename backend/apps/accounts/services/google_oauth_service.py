from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from ..models import User


class InvalidGoogleTokenError(Exception):
    pass


def authenticate_google_user(id_token_str):
    try:
        payload = id_token.verify_oauth2_token(
            id_token_str, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
        )
    except ValueError as exc:
        raise InvalidGoogleTokenError(str(exc)) from exc

    email = payload["email"]
    full_name = payload.get("name", "")

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "full_name": full_name,
            "auth_provider": "google",
            "is_verified": True,
        },
    )

    if not created and user.auth_provider != "google":
        user.auth_provider = "google"
        user.is_verified = True
        user.save(update_fields=["auth_provider", "is_verified"])

    return user
