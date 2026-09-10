import json
from datetime import date

from apps.market_data.services import market_data_service

from .client import create_chat_completion
from .tools import MARKET_TOOLS

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
- Extract commodity, city, days, and date from the user's message when present.
- Do not ask for commodity or city if they are already present in the user's message.
- If a required argument is genuinely missing, ask only for that missing argument.
- When calling tools, always provide complete valid JSON arguments.
- Keep final responses concise and practical.
"""

TOOL_HANDLERS = {
    "get_trend": lambda args: market_data_service.get_trend(**args),
    "get_anomaly": lambda args: market_data_service.get_anomaly(**args),
    "get_arbitrage": lambda args: market_data_service.get_arbitrage(**args),
    "get_advisory": lambda args: market_data_service.get_advisory(**args),
}


def execute_tool(call):
    tool_name = call.function.name
    handler = TOOL_HANDLERS.get(tool_name)

    if handler is None:
        return {"error": f"Unknown tool: {tool_name}"}

    try:
        args = json.loads(call.function.arguments)

    except json.JSONDecodeError:
        return {"error": "Tool arguments were not valid JSON."}

    # Apply application-level defaults
    if tool_name == "get_trend":
        args.setdefault("days", 7)

    if tool_name == "get_anomaly":
        args.setdefault("date", str(date.today()))

    try:
        return handler(args)

    except TypeError as exc:
        return {"error": f"Invalid tool arguments: {str(exc)}"}

    except Exception as exc:
        return {"error": f"Tool execution failed: {str(exc)}"}


def run_agent(user_message, history=None):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": user_message})

    completion = create_chat_completion(
        messages,
        tools=MARKET_TOOLS,
        tool_choice="auto",
    )

    reply = completion.choices[0].message

    # No tool required
    if not reply.tool_calls:
        if reply.content:
            return reply.content

        return "I couldn't process that request correctly.\nPlease try rephrasing it."
    messages.append(reply)

    for call in reply.tool_calls:
        result = execute_tool(call)

        messages.append(
            {
                "role": "tool",
                "tool_call_id": call.id,
                "name": call.function.name,
                "content": json.dumps(result),
            }
        )

    final = create_chat_completion(
        messages,
        tools=MARKET_TOOLS,
        tool_choice="none",
        max_tokens=256,
    )

    return (
        final.choices[0].message.content
        or "Market data was retrieved, but I couldn't format the result"
    )
