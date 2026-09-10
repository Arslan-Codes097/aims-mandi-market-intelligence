from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, OTPCode


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = (
        "email",
        "full_name",
        "is_verified",
        "is_active",
        "is_staff",
        "auth_provider",
        "created_at",
    )
    list_filter = (
        "is_verified",
        "is_active",
        "is_staff",
        "auth_provider",
    )
    search_fields = ("email", "full_name")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name",)}),
        ("Authentication", {"fields": ("auth_provider", "is_verified")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )

    readonly_fields = ("created_at", "updated_at", "last_login")

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "full_name",
                    "is_verified",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "code",
        "purpose",
        "expires_at",
        "is_used",
        "created_at",
    )
    list_filter = ("purpose", "is_used")
    search_fields = ("user__email", "code")
    readonly_fields = ("created_at",)
