from ..models import OTPCode
from .otp_service import generate_and_store_otp, verify_otp


def start_password_reset(user):
    return generate_and_store_otp(user, OTPCode.Purpose.PASSWORD_RESET)


def confirm_password_reset(user, code, new_password):
    if not verify_otp(user, code, OTPCode.Purpose.PASSWORD_RESET):
        return False

    user.set_password(new_password)
    user.save(update_fields=["password"])
    return True
