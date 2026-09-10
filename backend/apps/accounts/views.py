from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .services.email_service import send_otp_email

from .models import OTPCode, User
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    GoogleAuthSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResendOTPSerializer,
    ResetPasswordSerializer,
    VerifyOTPSerializer,
    issue_tokens_for,
)
from .services.google_oauth_service import (
    InvalidGoogleTokenError,
    authenticate_google_user,
)
from .services.otp_service import can_resend, generate_and_store_otp, verify_otp
from .services.password_service import confirm_password_reset, start_password_reset


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp = generate_and_store_otp(user, OTPCode.Purpose.EMAIL_VERIFICATION)
        send_otp_email(user.email, otp.code, otp.purpose)

        return Response(
            {"message": "Registered. Check your email for the verification code."},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_object_or_404(User, email=serializer.validated_data["email"])

        if not verify_otp(
            user, serializer.validated_data["code"], OTPCode.Purpose.EMAIL_VERIFICATION
        ):
            return Response(
                {"detail": "Invalid or expired code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_verified = True
        user.save(update_fields=["is_verified"])
        return Response(issue_tokens_for(user))


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_object_or_404(User, email=serializer.validated_data["email"])

        if not can_resend(user, OTPCode.Purpose.EMAIL_VERIFICATION):
            return Response(
                {"detail": "Please wait before requesting another code."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp = generate_and_store_otp(user, OTPCode.Purpose.EMAIL_VERIFICATION)
        send_otp_email(user.email, otp.code, otp.purpose)
        return Response({"message": "A new code has been sent."})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(issue_tokens_for(serializer.validated_data["user"]))


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = authenticate_google_user(serializer.validated_data["id_token"])
        except InvalidGoogleTokenError:
            return Response(
                {"detail": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(issue_tokens_for(user))


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            RefreshToken(request.data["refresh"]).blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(status=status.HTTP_205_RESET_CONTENT)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email=serializer.validated_data["email"]).first()

        if user:
            otp = start_password_reset(user)
            send_otp_email(user.email, otp.code, otp.purpose)

        return Response(
            {"message": "If that email exists, a reset code has been sent."}
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = get_object_or_404(User, email=data["email"])

        if not confirm_password_reset(user, data["code"], data["new_password"]):
            return Response(
                {"detail": "Invalid or expired code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"message": "Password reset successfully."})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"message": "Password changed successfully."})
