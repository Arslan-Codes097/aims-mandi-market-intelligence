import random
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from ..models import OTPCode


def generate_and_store_otp(user, purpose):
    OTPCode.objects.filter(user=user, purpose=purpose, is_used=False).update(
        is_used=True
    )

    code = f"{random.randint(0, 999999):06d}"
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

    return OTPCode.objects.create(
        user=user, code=code, purpose=purpose, expires_at=expires_at
    )


def verify_otp(user, code, purpose):
    otp = (
        OTPCode.objects.filter(user=user, purpose=purpose, code=code)
        .order_by("-created_at")
        .first()
    )

    if not otp or not otp.is_valid():
        return False

    otp.is_used = True
    otp.save(update_fields=["is_used"])
    return True


def can_resend(user, purpose):
    latest = (
        OTPCode.objects.filter(user=user, purpose=purpose)
        .order_by("-created_at")
        .first()
    )
    if not latest:
        return True

    seconds_since = (timezone.now() - latest.created_at).total_seconds()
    return seconds_since >= settings.OTP_RESEND_COOLDOWN_SECONDS
