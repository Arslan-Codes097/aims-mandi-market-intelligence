from rest_framework import serializers

from .models import ChatMessage, ChatSession


from drf_spectacular.utils import extend_schema_field


@extend_schema_field(serializers.CharField)
class ImageOrBase64Field(serializers.Field):
    """
    Accepts an uploaded image file, a base64 string (raw or data URI), or bytes.
    """

    def to_internal_value(self, data):
        if data is None or data == "":
            return None
        if isinstance(data, (str, bytes)):
            return data
        if hasattr(data, "read"):
            return data
        self.fail("invalid")

    def to_representation(self, value):
        return str(value)


class ChatMessageInSerializer(serializers.Serializer):
    message = serializers.CharField(
        max_length=1000, required=False, allow_blank=True, default=""
    )
    session_id = serializers.UUIDField(required=False, allow_null=True)
    image = ImageOrBase64Field(
        required=False,
        allow_null=True,
        help_text="Optional base64 image data URI, raw base64 string, or uploaded image file",
    )

    def validate(self, attrs):
        message = attrs.get("message", "").strip() if attrs.get("message") else ""
        image = attrs.get("image")
        request = self.context.get("request")
        if not message and not image and not (request and request.FILES.get("image")):
            raise serializers.ValidationError(
                "Either 'message' or 'image' must be provided."
            )
        return attrs



class ChatMessageOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "content", "created_at", "image", "grading"]


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ["id", "title", "created_at", "updated_at"]
        read_only_fields = fields
