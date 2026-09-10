from django.urls import path

from .views import MyPreferencesView

urlpatterns = [
    path("me/preferences/", MyPreferencesView.as_view(), name="my-preferences"),
]
