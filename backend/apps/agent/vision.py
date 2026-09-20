import base64
import io
import json
import logging
import os
import re
from typing import Any, List, Optional, Tuple

from django.conf import settings
from google import genai
from google.genai import types
from PIL import Image

logger = logging.getLogger(__name__)

PRIMARY_VISION_MODEL = getattr(settings, "GEMINI_VISION_MODEL", None) or os.environ.get(
    "GEMINI_VISION_MODEL", "gemini-3.7-flash"
)
FALLBACK_VISION_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]

NON_MANDI_REPLY = "The image you provided doesn't match with any mandi item."

VISION_SYSTEM_PROMPT = """You are an expert Agricultural Quality Inspector and Mandi Crop Grading Specialist for the AMIS (Agricultural Market Information System) platform.

Your task is to analyze the provided image and respond to the user's message.

Evaluate the image according to the following strict criteria:
1. Mandi Commodity Verification:
   - Determine whether the image displays an agricultural or mandi commodity (such as fresh fruits, vegetables, grains, pulses, or crops).
   - If the image does NOT contain an agricultural or mandi product (for example, people, electronics, vehicles, furniture, packaged industrial goods, documents, animals, etc.):
     * is_mandi_item: false
     * commodity: null
     * grade: null
     * has_disease_or_defect: false
     * disease_name: null
     * reasoning: A concise explanation describing what is depicted and confirming it is not a mandi agricultural item.
     * reply: MUST be exactly "The image you provided doesn't match with any mandi item."

2. Crop Quality Grading and Defect Inspection (if is_mandi_item is true):
   - commodity: Standard English commodity name (e.g., "Tomato", "Potato", "Onion", "Mango", "Wheat", "Apple", "Chili").
   - grade: Assign one of "Grade A", "Grade B", or "Grade C":
     * "Grade A": Fresh, optimal firmness, vibrant uniform color, no blemishes or rot, premium auction/export grade.
     * "Grade B": Minor superficial blemishes, slight color or size variation, standard commercial grade.
     * "Grade C": Noticeable rot, fungal/bacterial decay, insect bites, deep bruising, cuts, or overripeness.
   - has_disease_or_defect: boolean flag (true if any disease, rot, pest damage, or physical defects are detected, otherwise false).
   - disease_name: Exact disease or defect name if identified (e.g., "Early Blight", "Late Blight", "Blossom End Rot", "Bacterial Spot", "Fruit Borer Damage", "Mechanical Bruising", "Anthracnose"), or null if clean.
   - reasoning: Visual justification highlighting color, shape, firmness, surface texture, defect presence, and freshness indicators.
   - reply: A fluent, conversational, and helpful answer directly responding to the user's question or statement. Integrate the grading, quality observations, and practical commercial/storage advice naturally.
   - CRITICAL LANGUAGE RULE: Always reply in the EXACT SAME language and script used by the user. If the user writes in English, reply ONLY in English. Do NOT switch to Urdu or Arabic script. Only reply in Urdu script if the user wrote in Urdu script.

Output MUST be a single valid JSON object with the following structure:
{
  "is_mandi_item": boolean,
  "commodity": string or null,
  "grade": string or null,
  "has_disease_or_defect": boolean,
  "disease_name": string or null,
  "reasoning": string,
  "reply": string
}
"""


def _get_gemini_client() -> genai.Client:
    """Instantiate and return the google-genai Client."""
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in settings or environment.")
    return genai.Client(api_key=api_key)


def _prepare_image(image_input: Any) -> Tuple[bytes, str]:
    """
    Normalizes various image input types into (bytes, mime_type).
    Validates the image data using Pillow.
    """
    raw_bytes: Optional[bytes] = None
    guessed_mime: Optional[str] = None

    if isinstance(image_input, (bytes, bytearray)):
        raw_bytes = bytes(image_input)
    elif hasattr(image_input, "read"):
        if hasattr(image_input, "seek"):
            image_input.seek(0)
        raw_bytes = image_input.read()
        if hasattr(image_input, "content_type") and image_input.content_type:
            guessed_mime = image_input.content_type
    elif isinstance(image_input, str):
        cleaned = image_input.strip()
        if cleaned.startswith("data:") and ";base64," in cleaned:
            mime_part, b64_part = cleaned.split(";base64,", 1)
            guessed_mime = mime_part[5:].strip()
            raw_bytes = base64.b64decode(b64_part)
        else:
            raw_bytes = base64.b64decode(cleaned)
    elif isinstance(image_input, Image.Image):
        buf = io.BytesIO()
        fmt = image_input.format or "JPEG"
        image_input.save(buf, format=fmt)
        raw_bytes = buf.getvalue()
        guessed_mime = f"image/{fmt.lower()}"
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    if not raw_bytes:
        raise ValueError("Provided image data is empty.")

    try:
        pil_img = Image.open(io.BytesIO(raw_bytes))
        pil_img.verify()
        pil_img = Image.open(io.BytesIO(raw_bytes))
        fmt = (pil_img.format or "JPEG").lower()
        if fmt == "jpg":
            fmt = "jpeg"
        mime_type = guessed_mime or f"image/{fmt}"
    except Exception as exc:
        raise ValueError(f"Invalid image format or corrupted image: {exc}") from exc

    return raw_bytes, mime_type


def _parse_vision_response(raw_text: str) -> dict:
    """Parse JSON from the model response text, stripping any markdown fences."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError(f"Failed to parse JSON from vision model response: {cleaned}")


def grade_crop_image(
    image: Any,
    user_message: str = "",
    history: Optional[List[dict]] = None,
) -> Tuple[str, dict]:
    """
    Grades a crop image using Google GenAI Gemini vision model.

    Returns:
        tuple (reply: str, grading_data: dict)
    """
    image_bytes, mime_type = _prepare_image(image)
    client = _get_gemini_client()

    conversation_context = ""
    if history:
        context_lines = []
        for msg in history[-4:]:
            role = "User" if msg.get("role") == "user" else "Assistant"
            context_lines.append(f"{role}: {msg.get('content')}")
        if context_lines:
            conversation_context = "Recent conversation:\n" + "\n".join(context_lines) + "\n\n"

    prompt_text = (
        f"{conversation_context}User query: {user_message.strip() if user_message else 'Grade this crop and assess quality and defects.'}"
    )

    contents = [
        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        prompt_text,
    ]

    config = types.GenerateContentConfig(
        system_instruction=VISION_SYSTEM_PROMPT,
        response_mime_type="application/json",
        temperature=0.2,
    )

    models_to_try = [PRIMARY_VISION_MODEL]
    for fallback in FALLBACK_VISION_MODELS:
        if fallback not in models_to_try:
            models_to_try.append(fallback)

    response = None
    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            if response and response.text:
                logger.info("Successfully analyzed image using model %s", model_name)
                break
        except Exception as exc:
            logger.warning("Vision analysis with model %s failed: %s", model_name, exc)
            last_error = exc

    if response is None or not response.text:
        raise RuntimeError(
            f"Failed to generate crop grading from Gemini models: {last_error}"
        )

    parsed = _parse_vision_response(response.text)

    is_mandi_item = bool(parsed.get("is_mandi_item"))

    if not is_mandi_item:
        reply = NON_MANDI_REPLY
        grading_data = {
            "is_mandi_item": False,
            "commodity": None,
            "grade": None,
            "has_disease_or_defect": False,
            "disease_name": None,
            "reasoning": parsed.get("reasoning")
            or NON_MANDI_REPLY,
        }
        return reply, grading_data

    commodity = parsed.get("commodity")
    grade = parsed.get("grade")
    has_disease = bool(parsed.get("has_disease_or_defect"))
    disease_name = parsed.get("disease_name") if has_disease else None
    reasoning = parsed.get("reasoning", "")
    reply = parsed.get("reply") or f"Identified crop: {commodity}. Grade: {grade}."

    grading_data = {
        "is_mandi_item": True,
        "commodity": commodity,
        "crop": commodity,
        "grade": grade,
        "has_disease_or_defect": has_disease,
        "disease": disease_name if has_disease else "None detected (Healthy)",
        "diseaseDetected": has_disease,
        "disease_name": disease_name,
        "reasoning": reasoning,
    }

    return reply, grading_data
