from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, ChatSession
from .orchestrator import run_agent
from .serializers import (
    ChatMessageInSerializer,
    ChatMessageOutSerializer,
    ChatSessionSerializer,
)

MAX_HISTORY_MESSAGES = 10


class ChatSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        return Response(ChatSessionSerializer(sessions, many=True).data)

    def post(self, request):
        session = ChatSession.objects.create(user=request.user)
        return Response(
            ChatSessionSerializer(session).data, status=status.HTTP_201_CREATED
        )


class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatSessionMessagesView(ListAPIView):
    serializer_class = ChatMessageOutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session = get_object_or_404(
            ChatSession, id=self.kwargs["session_id"], user=self.request.user
        )
        return session.messages.all()


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatMessageInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data.get("session_id"):
            session = get_object_or_404(
                ChatSession, id=data["session_id"], user=request.user
            )
        else:
            session = ChatSession.objects.create(user=request.user)

        recent = list(session.messages.order_by("-created_at")[:MAX_HISTORY_MESSAGES])
        history = [{"role": m.role, "content": m.content} for m in reversed(recent)]

        ChatMessage.objects.create(
            session=session, role=ChatMessage.Role.USER, content=data["message"]
        )
        reply = run_agent(data["message"], history=history, user=request.user)
        ChatMessage.objects.create(
            session=session, role=ChatMessage.Role.ASSISTANT, content=reply
        )

        if session.messages.count() <= 2:
            session.title = data["message"][:50]
        session.save()

        return Response({"reply": reply, "session_id": str(session.id)})
