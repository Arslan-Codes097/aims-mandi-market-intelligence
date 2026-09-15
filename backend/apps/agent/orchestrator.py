import json
import logging
from datetime import date

from apps.market_data.services import market_data_service

from .client import create_chat_completion
from .tools import MARKET_TOOLS

MAX_TOOL_ROUNDS = 4

SYSTEM_PROMPT = """
You are a multilingual market assistant for Pakistani agricultural commodities.

You understand English, Urdu, Roman Urdu, Punjabi, and Roman Punjabi.

Language rules:
- Understand commodity names and Pakistani city names regardless of the language or script used.
- Examples:
  ٹماٹر = Tomato
  آلو = Potato
  پیاز = Onion
  گندم = Wheat
  لاہور = Lahore
  فیصل آباد = Faisalabad
  ملتان = Multan
- When calling tools, convert commodity and city names to their standard English names.
- Always reply in the same language/script used by the user.

Tool rules:
- Use the available tools whenever the user asks about trends, anomalies,
  arbitrage opportunities, or buy/sell/hold recommendations.
- Never invent market numbers.
- IMPORTANT: ALWAYS use the prefix "PKR " or "Rs. " when displaying prices (e.g., PKR 165). NEVER use the Indian Rupee symbol (₹). All prices returned by tools are strictly per-KG.
- Extract commodity, city, days, and date from the user's message when present.
- Do not ask for commodity or city if they are already present in the user's message.
- If a required argument is genuinely missing, ask only for that missing argument.
- When calling tools, always provide complete valid JSON arguments with correct types
  (days and distance_km must be numbers, not strings).
- If the user asks about more than one city or commodity, call the tool once per
  city/commodity combination. You may call tools across multiple turns if needed —
  you are not limited to a single round of tool calls.
- Keep final responses concise and practical.
"""

TOOL_HANDLERS = {
    "get_trend": lambda args: market_data_service.get_trend(**args),
    "get_anomaly": lambda args: market_data_service.get_anomaly(**args),
    "get_arbitrage": lambda args: market_data_service.get_arbitrage(**args),
    "get_advisory": lambda args: market_data_service.get_advisory(**args),
}

NUMERIC_ARGS = {"days", "distance_km"}


def _coerce_arg_types(args):
    """Model sometimes sends numbers as strings — normalize before calling handlers."""
    coerced = dict(args)
    for key in NUMERIC_ARGS:
        if key in coerced and coerced[key] is not None:
            try:
                coerced[key] = (
                    int(coerced[key]) if key == "days" else float(coerced[key])
                )
            except (TypeError, ValueError):
                pass
    return coerced


def execute_tool(call):
    tool_name = call.function.name
    handler = TOOL_HANDLERS.get(tool_name)

    if handler is None:
        return {"error": f"Unknown tool: {tool_name}"}

    try:
        args = json.loads(call.function.arguments)
    except json.JSONDecodeError:
        return {"error": "Tool arguments were not valid JSON."}

    args = _coerce_arg_types(args)

    if tool_name == "get_trend":
        args.setdefault("days", 7)
    if tool_name == "get_anomaly":
        args.setdefault("date", str(date.today()))

    try:
        result = handler(args)
        return result
    except TypeError as exc:
        return {"error": f"Invalid tool arguments: {str(exc)}"}
    except Exception as exc:
        return {"error": f"Tool execution failed: {str(exc)}"}


def _any_tool_errored(tool_results):
    return any(isinstance(r, dict) and "error" in r for r in tool_results)


def _safe_content(content, user_message, fallback=None):
    """Single choke point for every reply that reaches the user.

    Guards against models that leak raw tool-call syntax as text instead of
    using the structured tool_calls field, and against empty completions.
    """
    if not content:
        return (
            "I couldn't understand that. Could you rephrase your question "
            "with a commodity and city?"
        )

    if "<tool_call>" in content or "<function=" in content:
        return fallback or (
            "Sorry, I had trouble understanding that request. "
            "Please try asking about one commodity/city at a time."
        )

    # Forcefully strip out Indian Rupee symbols that LLMs often default to
    content = content.replace("₹ ", "PKR ").replace("₹", "PKR ")

    return content


def run_agent(user_message, history=None, user=None):
    sys_prompt = SYSTEM_PROMPT
    if user:
        sys_prompt += f"\n\nUser Profile Context (use this to personalize your answers):"
        if getattr(user, 'full_name', None):
            sys_prompt += f"\n- Name: {user.full_name}"
        try:
            profile = user.preferences
            if profile.occupation:
                sys_prompt += f"\n- Occupation: {profile.occupation}"
            if profile.home_city:
                sys_prompt += f"\n- Home City: {profile.home_city}"
            if profile.preferred_commodities:
                sys_prompt += f"\n- Preferred Commodities: {', '.join(profile.preferred_commodities)}"
        except Exception:
            pass
            
    messages = [{"role": "system", "content": sys_prompt}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": user_message})

    tool_results = []

    for round_num in range(MAX_TOOL_ROUNDS):
        completion = create_chat_completion(
            messages, tools=MARKET_TOOLS, tool_choice="auto"
        )
        reply = completion.choices[0].message

        if not reply.tool_calls:
            return _safe_content(reply.content, user_message)

        messages.append(reply)

        for call in reply.tool_calls:
            result = execute_tool(call)
            tool_results.append(result)
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call.id,
                    "content": json.dumps(result),
                }
            )

    final = create_chat_completion(messages, max_tokens=512)
    final_choice = final.choices[0]

    if not final_choice.message.content and _any_tool_errored(tool_results):
        errors = [
            r["error"] for r in tool_results if isinstance(r, dict) and "error" in r
        ]
        return (
            "Sorry, I couldn't fetch that market data right now. "
            "Please try again in a moment."
        )

    return _safe_content(
        final_choice.message.content,
        user_message,
        fallback=(
            "I found some of the data but had trouble finishing the comparison. "
            "Could you ask about one city at a time?"
        ),
    )
