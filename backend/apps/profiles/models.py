import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models


class UserPreference(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preferences"
    )
    preferred_cities = models.JSONField(default=list, blank=True)
    preferred_commodities = models.JSONField(default=list, blank=True)
    watchlist = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_preferences"

    def __str__(self):
        return f"Preferences for {self.user.email}"
