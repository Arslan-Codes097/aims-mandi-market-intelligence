from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),
    path("auth/resend-otp/", views.ResendOTPView.as_view(), name="resend-otp"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/google/", views.GoogleLoginView.as_view(), name="google-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path(
        "auth/forgot-password/",
        views.ForgotPasswordView.as_view(),
        name="forgot-password",
    ),
    path(
        "auth/reset-password/", views.ResetPasswordView.as_view(), name="reset-password"
    ),
    path(
        "auth/change-password/",
        views.ChangePasswordView.as_view(),
        name="change-password",
    ),
]
