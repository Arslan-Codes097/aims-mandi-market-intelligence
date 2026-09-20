import base64
import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
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
from .vision import grade_crop_image

logger = logging.getLogger(__name__)

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
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = ChatMessageInSerializer(
            data=request.data, context={"request": request}
        )
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

        image_input = data.get("image") or request.FILES.get("image")

        if image_input:
            user_message = (
                data.get("message", "").strip() if data.get("message") else ""
            )
            user_content = (
                user_message if user_message else "[Uploaded crop image for grading]"
            )

            # Format stored image string for persistent frontend rendering
            stored_image = None
            if isinstance(image_input, str):
                stored_image = (
                    image_input
                    if image_input.startswith("data:")
                    else f"data:image/jpeg;base64,{image_input}"
                )
            elif hasattr(image_input, "read"):
                try:
                    if hasattr(image_input, "seek"):
                        image_input.seek(0)
                    raw_b = image_input.read()
                    mime = (
                        getattr(image_input, "content_type", "image/jpeg")
                        or "image/jpeg"
                    )
                    b64 = base64.b64encode(raw_b).decode("utf-8")
                    stored_image = f"data:{mime};base64,{b64}"
                except Exception:
                    pass

            ChatMessage.objects.create(
                session=session,
                role=ChatMessage.Role.USER,
                content=user_content,
                image=stored_image,
            )

            try:
                reply, grading_data = grade_crop_image(
                    image=image_input,
                    user_message=user_message,
                    history=history,
                )
            except ValueError as exc:
                return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as exc:
                logger.exception("Error during crop vision grading: %s", exc)
                return Response(
                    {"error": "Failed to analyze crop image. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            ChatMessage.objects.create(
                session=session,
                role=ChatMessage.Role.ASSISTANT,
                content=reply,
                grading=grading_data,
            )

            if session.messages.count() <= 2:
                title_text = user_message or (
                    f"{grading_data.get('commodity')} Grading"
                    if grading_data and grading_data.get("commodity")
                    else "Crop Grading"
                )
                session.title = title_text[:50]
            session.save()

            return Response(
                {
                    "reply": reply,
                    "session_id": str(session.id),
                    "grading": grading_data,
                }
            )

        message_text = data.get("message", "")
        ChatMessage.objects.create(
            session=session, role=ChatMessage.Role.USER, content=message_text
        )
        reply = run_agent(message_text, history=history, user=request.user)
        ChatMessage.objects.create(
            session=session, role=ChatMessage.Role.ASSISTANT, content=reply
        )

        if session.messages.count() <= 2:
            session.title = message_text[:50]
        session.save()

        return Response({"reply": reply, "session_id": str(session.id)})
