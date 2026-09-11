import logging

from django.conf import settings
from groq import Groq, BadRequestError, APIError

logger = logging.getLogger(__name__)

_client = Groq(api_key=settings.GROQ_API_KEY, timeout=30.0)


def create_chat_completion(
    messages,
    tools=None,
    tool_choice="auto",
    max_tokens=512,
    reasoning_effort="none",
):
    params = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.2,
        "reasoning_effort": reasoning_effort,
    }

    if tools:
        params["tools"] = tools
        params["tool_choice"] = tool_choice

    try:
        return _client.chat.completions.create(**params)
    except BadRequestError:
        logger.exception(
            "Groq rejected the request (model=%s, tools=%s)",
            settings.GROQ_MODEL,
            bool(tools),
        )
        raise
    except APIError:
        logger.exception("Groq API error on chat completion")
        raise
