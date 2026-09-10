from rest_framework import serializers

from .models import ChatMessage, ChatSession


class ChatMessageInSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)
    session_id = serializers.UUIDField(required=False)


class ChatMessageOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "content", "created_at"]


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ["id", "title", "created_at", "updated_at"]
        read_only_fields = fields
