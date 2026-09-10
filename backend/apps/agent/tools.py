MARKET_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_trend",
            "description": (
                "Get historical price trend for one agricultural commodity "
                "in one Pakistani city."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "commodity": {
                        "type": "string",
                        "description": (
                            "Commodity name, for example Tomato, Potato, Onion, or Wheat."
                        ),
                    },
                    "city": {
                        "type": "string",
                        "description": (
                            "Full Pakistani city name, for example Lahore, "
                            "Faisalabad, Sahiwal, Karachi, or Multan."
                        ),
                    },
                    "days": {
                        "type": "integer",
                        "description": "Number of previous days to retrieve.",
                        "default": 7,
                        "minimum": 1,
                        "maximum": 90,
                    },
                },
                "required": ["commodity", "city"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_anomaly",
            "description": (
                "Check whether a commodity price in a Pakistani city "
                "is unusually high or low for a specific date."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "commodity": {
                        "type": "string",
                        "description": "Commodity name, for example Tomato.",
                    },
                    "city": {
                        "type": "string",
                        "description": "Full Pakistani city name, for example Lahore.",
                    },
                    "date": {
                        "type": "string",
                        "description": "Date strictly in YYYY-MM-DD format.",
                    },
                },
                "required": ["commodity", "city", "date"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_arbitrage",
            "description": (
                "Compare current prices across Pakistani cities and find "
                "the best city to buy and the best city to sell."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "commodity": {
                        "type": "string",
                        "description": "Commodity name, for example Tomato.",
                    },
                },
                "required": ["commodity"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_advisory",
            "description": (
                "Get a buy, sell, or hold recommendation for a commodity "
                "in a Pakistani city."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "commodity": {
                        "type": "string",
                        "description": "Commodity name, for example Tomato.",
                    },
                    "city": {
                        "type": "string",
                        "description": "Full Pakistani city name, for example Lahore.",
                    },
                },
                "required": ["commodity", "city"],
                "additionalProperties": False,
            },
        },
    },
]
