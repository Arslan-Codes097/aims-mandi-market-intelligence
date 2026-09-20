"""
Verification test script for Computer Vision Crop Grading feature.
Runs end-to-end tests covering:
1. Requirements verification (google-genai, pillow)
2. Settings configuration (GEMINI_API_KEY, GEMINI_VISION_MODEL)
3. Image preparation and normalization (Base64 data URI, raw base64, bytes, PIL Image)
4. Vision response parsing and JSON handling
5. Mandi vs non-mandi item grading logic
6. ChatMessageInSerializer validation
7. ChatView endpoint routing and history persistence (mocked and live checks)
"""

import base64
import io
import os
import sys
import unittest
from unittest.mock import MagicMock, patch

import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from PIL import Image
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.agent.models import ChatMessage, ChatSession
from apps.agent.serializers import ChatMessageInSerializer
from apps.agent.views import ChatView
from apps.agent.vision import (
    NON_MANDI_REPLY,
    PRIMARY_VISION_MODEL,
    _parse_vision_response,
    _prepare_image,
    grade_crop_image,
)

User = get_user_model()


def _create_sample_image_bytes(color=(255, 0, 0), fmt="PNG") -> bytes:
    """Create a simple in-memory test image."""
    img = Image.new("RGB", (64, 64), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


class TestRequirementsAndSettings(unittest.TestCase):
    def test_requirements_file(self):
        req_path = os.path.join(settings.BASE_DIR, "requirements.txt")
        with open(req_path, "r", encoding="utf-8") as f:
            content = f.read().lower()
        self.assertIn("google-genai", content, "google-genai must be in requirements.txt")
        self.assertIn("pillow", content, "pillow must be in requirements.txt")

    def test_settings_gemini(self):
        self.assertTrue(hasattr(settings, "GEMINI_API_KEY"), "GEMINI_API_KEY must be in settings")
        self.assertTrue(hasattr(settings, "GEMINI_VISION_MODEL"), "GEMINI_VISION_MODEL must be in settings")
        self.assertEqual(settings.GEMINI_VISION_MODEL, "gemini-3.6-flash")


class TestVisionModule(unittest.TestCase):
    def setUp(self):
        self.img_bytes = _create_sample_image_bytes(color=(200, 50, 50), fmt="PNG")
        self.b64_raw = base64.b64encode(self.img_bytes).decode("utf-8")
        self.b64_uri = f"data:image/png;base64,{self.b64_raw}"

    def test_prepare_image_bytes(self):
        data, mime = _prepare_image(self.img_bytes)
        self.assertEqual(data, self.img_bytes)
        self.assertEqual(mime, "image/png")

    def test_prepare_image_raw_base64(self):
        data, mime = _prepare_image(self.b64_raw)
        self.assertEqual(data, self.img_bytes)
        self.assertEqual(mime, "image/png")

    def test_prepare_image_data_uri(self):
        data, mime = _prepare_image(self.b64_uri)
        self.assertEqual(data, self.img_bytes)
        self.assertEqual(mime, "image/png")

    def test_prepare_image_pil(self):
        pil_img = Image.open(io.BytesIO(self.img_bytes))
        data, mime = _prepare_image(pil_img)
        self.assertTrue(len(data) > 0)
        self.assertIn(mime, ["image/png", "image/jpeg"])

    def test_prepare_image_invalid(self):
        with self.assertRaises(ValueError):
            _prepare_image(b"not an image")

    def test_parse_vision_response_clean_json(self):
        json_str = '{"is_mandi_item": true, "commodity": "Tomato", "grade": "Grade A"}'
        res = _parse_vision_response(json_str)
        self.assertEqual(res["commodity"], "Tomato")
        self.assertTrue(res["is_mandi_item"])

    def test_parse_vision_response_markdown_fence(self):
        markdown_str = """```json
{
  "is_mandi_item": false,
  "commodity": null,
  "grade": null,
  "reasoning": "This is a car."
}
```"""
        res = _parse_vision_response(markdown_str)
        self.assertFalse(res["is_mandi_item"])
        self.assertEqual(res["reasoning"], "This is a car.")

    @patch("apps.agent.vision._get_gemini_client")
    def test_grade_crop_image_non_mandi(self, mock_get_client):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"is_mandi_item": false, "reasoning": "A laptop is visible."}'
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        reply, grading = grade_crop_image(self.b64_uri, "What is this?")
        self.assertEqual(reply, NON_MANDI_REPLY)
        self.assertFalse(grading["is_mandi_item"])
        self.assertIsNone(grading["commodity"])
        self.assertIsNone(grading["grade"])
        self.assertFalse(grading["has_disease_or_defect"])

    @patch("apps.agent.vision._get_gemini_client")
    def test_grade_crop_image_mandi_crop(self, mock_get_client):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = """{
            "is_mandi_item": true,
            "commodity": "Tomato",
            "grade": "Grade A",
            "has_disease_or_defect": false,
            "disease_name": null,
            "reasoning": "Vibrant red color, excellent firmness, and uniform shape.",
            "reply": "These tomatoes are premium Grade A quality with excellent market value."
        }"""
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        reply, grading = grade_crop_image(self.b64_uri, "Rate these tomatoes")
        self.assertIn("Grade A", reply)
        self.assertTrue(grading["is_mandi_item"])
        self.assertEqual(grading["commodity"], "Tomato")
        self.assertEqual(grading["grade"], "Grade A")
        self.assertFalse(grading["has_disease_or_defect"])
        self.assertIsNone(grading["disease_name"])


class TestSerializer(unittest.TestCase):
    def setUp(self):
        self.img_b64 = f"data:image/png;base64,{base64.b64encode(_create_sample_image_bytes()).decode('utf-8')}"

    def test_serializer_text_only(self):
        s = ChatMessageInSerializer(data={"message": "What is the tomato price?"})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["message"], "What is the tomato price?")

    def test_serializer_image_only(self):
        s = ChatMessageInSerializer(data={"image": self.img_b64})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["message"], "")
        self.assertEqual(s.validated_data["image"], self.img_b64)

    def test_serializer_both_message_and_image(self):
        s = ChatMessageInSerializer(data={"message": "Check quality", "image": self.img_b64})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["message"], "Check quality")
        self.assertEqual(s.validated_data["image"], self.img_b64)

    def test_serializer_empty_fails(self):
        s = ChatMessageInSerializer(data={})
        self.assertFalse(s.is_valid())
        self.assertIn("non_field_errors", s.errors)


class TestChatViewEndpoint(unittest.TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user, _ = User.objects.get_or_create(
            email="vision_tester@example.com",
            defaults={"full_name": "Vision Tester", "is_active": True},
        )
        self.view = ChatView.as_view()
        self.img_b64 = f"data:image/png;base64,{base64.b64encode(_create_sample_image_bytes()).decode('utf-8')}"

    @patch("apps.agent.views.run_agent")
    def test_text_chat_unbroken(self, mock_run_agent):
        mock_run_agent.return_value = "Today's tomato price in Lahore is PKR 120/KG."
        request = self.factory.post(
            "/api/agent/chat/",
            {"message": "Tomato price in Lahore?"},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = self.view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("reply", response.data)
        self.assertIn("session_id", response.data)
        self.assertNotIn("grading", response.data)
        self.assertEqual(response.data["reply"], "Today's tomato price in Lahore is PKR 120/KG.")

        # Check DB history
        session = ChatSession.objects.get(id=response.data["session_id"])
        messages = list(session.messages.order_by("created_at"))
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0].role, ChatMessage.Role.USER)
        self.assertEqual(messages[1].role, ChatMessage.Role.ASSISTANT)

    @patch("apps.agent.views.grade_crop_image")
    def test_image_grading_chat(self, mock_grade):
        mock_grading_data = {
            "is_mandi_item": True,
            "commodity": "Onion",
            "grade": "Grade B",
            "has_disease_or_defect": True,
            "disease_name": "Minor Sprouting",
            "reasoning": "Some onions show early signs of green shoot sprouting.",
        }
        mock_grade.return_value = (
            "These onions are Grade B due to early signs of sprouting.",
            mock_grading_data,
        )

        request = self.factory.post(
            "/api/agent/chat/",
            {"message": "Are these onions fresh?", "image": self.img_b64},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = self.view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("reply", response.data)
        self.assertIn("session_id", response.data)
        self.assertIn("grading", response.data)
        self.assertEqual(response.data["grading"]["grade"], "Grade B")
        self.assertEqual(response.data["grading"]["commodity"], "Onion")
        self.assertTrue(response.data["grading"]["has_disease_or_defect"])

        # Check DB history
        session = ChatSession.objects.get(id=response.data["session_id"])
        messages = list(session.messages.order_by("created_at"))
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0].content, "Are these onions fresh?")
        self.assertEqual(messages[1].content, "These onions are Grade B due to early signs of sprouting.")

    @patch("apps.agent.views.grade_crop_image")
    def test_non_mandi_image_chat(self, mock_grade):
        mock_grading_data = {
            "is_mandi_item": False,
            "commodity": None,
            "grade": None,
            "has_disease_or_defect": False,
            "disease_name": None,
            "reasoning": "The image is a smartphone.",
        }
        mock_grade.return_value = (NON_MANDI_REPLY, mock_grading_data)

        request = self.factory.post(
            "/api/agent/chat/",
            {"image": self.img_b64},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = self.view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reply"], NON_MANDI_REPLY)
        self.assertFalse(response.data["grading"]["is_mandi_item"])


def run_all_tests():
    suite = unittest.TestSuite()
    loader = unittest.TestLoader()
    suite.addTests(loader.loadTestsFromTestCase(TestRequirementsAndSettings))
    suite.addTests(loader.loadTestsFromTestCase(TestVisionModule))
    suite.addTests(loader.loadTestsFromTestCase(TestSerializer))
    suite.addTests(loader.loadTestsFromTestCase(TestChatViewEndpoint))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
