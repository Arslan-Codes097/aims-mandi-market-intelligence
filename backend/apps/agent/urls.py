from django.urls import path

from . import views

urlpatterns = [
    path("chat/", views.ChatView.as_view(), name="chat"),
    path(
        "chat/sessions/",
        views.ChatSessionListCreateView.as_view(),
        name="chat-sessions",
    ),
    path(
        "chat/sessions/<uuid:session_id>/messages/",
        views.ChatSessionMessagesView.as_view(),
        name="chat-session-messages",
    ),
    path(
        "chat/sessions/<uuid:session_id>/",
        views.ChatSessionDetailView.as_view(),
        name="chat-session-detail",
    ),
]
