from django.conf import settings
from groq import Groq, BadRequestError

_client = Groq(api_key=settings.GROQ_API_KEY)


def create_chat_completion(
    messages,
    tools=None,
    tool_choice="auto",
    max_tokens=512,
):
    params = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }

    if tools:
        params["tools"] = tools
        params["tool_choice"] = tool_choice

    return _client.chat.completions.create(**params)
