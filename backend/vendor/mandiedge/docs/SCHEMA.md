# System Schema & API Contracts

This document defines the strict data contracts between the Data Layer (Person A) and the Interface Layer (Person B). 

**Rule:** Neither person is allowed to change these structures without agreeing with the other. Person B will build the mocked API based exactly on these outputs. Person A will build the database and logic to output exactly these structures.

---

## 1. Database Schema (Postgres / Supabase)

### Table: `prices`
Stores the daily historical data scraped from AMIS.
* `id`: UUID (Primary Key)
* `commodity`: String (e.g., "Tomato", "Onion")
* `city`: String (e.g., "Lahore", "Sahiwal")
* `date`: Date (YYYY-MM-DD)
* `min_price`: Integer/Float
* `max_price`: Integer/Float
* `fqp`: Integer/Float (Fair Quality Price / Average)
* `arrival_quantity`: Integer/Float
* `scraped_at`: Timestamp (When the scraper fetched this)

### Table: `fuel_prices`
Tracks the daily price of high-speed diesel for logistics calculations.
* `date`: Date (Primary Key)
* `diesel_price`: Float
* `created_at`: Timestamp

### Table: `users`
Tracks unique users interacting with the agent/dashboard.
* `id`: UUID (Primary Key)
* `created_at`: Timestamp

### Table: `user_preferences`
Stores context for the AI agent so it can personalize responses.
* `user_id`: UUID (Foreign Key -> users.id)
* `preferred_cities`: Array of Strings (e.g., `["Lahore", "Multan"]`)
* `preferred_commodities`: Array of Strings (e.g., `["Tomato", "Potato"]`)
* `watchlist`: Array of Strings

### Table: `chat_sessions`
Represents a specific, ongoing chat thread between the user and the AI.
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key -> users.id)
* `title`: String (Auto-generated title of the chat)
* `created_at`: Timestamp
* `updated_at`: Timestamp

### Table: `chat_messages`
Stores the actual back-and-forth dialogue for a specific chat session.
* `id`: UUID (Primary Key)
* `session_id`: UUID (Foreign Key -> chat_sessions.id)
* `role`: String (Must be "user", "assistant", or "tool")
* `content`: Text (The actual message body)
* `created_at`: Timestamp

---

## 2. Core Intelligence Functions & API Contracts

These are the Python functions Person A will write, which map 1:1 to the API endpoints Person B will expose to the AI Agent.

### A. `get_trend`
Calculates the price trajectory over a given period.
* **Input Arguments:** 
  * `commodity` (String)
  * `city` (String)
  * `days` (Integer, e.g., 7 or 30)
* **Expected Output JSON:**
  ```json
  {
    "direction": "rising", // Can be: "rising", "falling", "stable"
    "pct_change": 12.5,
    "data_points": [
      {"date": "2023-10-01", "price": 100},
      {"date": "2023-10-02", "price": 110}
    ]
  }
  ```

### B. `get_anomaly`
Uses Z-scores (standard deviations) to determine if today's price is highly unusual compared to the recent historical average.
* **Input Arguments:** 
  * `commodity` (String)
  * `city` (String)
  * `date` (String, YYYY-MM-DD)
* **Expected Output JSON:**
  ```json
  {
    "is_anomaly": true,
    "z_score": 2.8,
    "expected_range": {
      "min_expected": 85,
      "max_expected": 115
    },
    "actual_price": 140
  }
  ```

### C. `get_arbitrage`
Finds the cross-city price gap to identify trading opportunities, deducting actual fuel transport costs.
* **Input Arguments:** 
  * `commodity` (String)
  * `distance_km` (Float, optional)
* **Expected Output JSON:**
  ```json
  {
    "best_buy_city": "Sahiwal",
    "best_sell_city": "Lahore",
    "gross_margin": 10900.0,
    "net_margin": 3130.0,
    "travel_cost": 7770.0,
    "prices_by_city": [
      {"city": "Sahiwal", "price": 60},
      {"city": "Faisalabad", "price": 85},
      {"city": "Lahore", "price": 105}
    ]
  }
  ```

### D. `get_advisory`
Combines trend and anomaly data to give a basic rule-based recommendation.
* **Input Arguments:** 
  * `commodity` (String)
  * `city` (String)
* **Expected Output JSON:**
  ```json
  {
    "recommendation": "sell", // Can be: "buy", "sell", "hold"
    "reasoning": "Price has risen 15% in 3 days and is currently an anomaly above the expected range.",
    "confidence": "high" // Can be: "low", "medium", "high"
  }
  ```
