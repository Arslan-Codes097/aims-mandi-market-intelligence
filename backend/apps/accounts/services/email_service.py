from django.conf import settings
from django.core.mail import send_mail

from ..models import OTPCode


def send_otp_email(email, code, purpose):
    subject = (
        "Verify your email"
        if purpose == OTPCode.Purpose.EMAIL_VERIFICATION
        else "Reset your password"
    )
    message = f"Your verification code is {code}. It expires in {settings.OTP_EXPIRY_MINUTES} minutes."
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
