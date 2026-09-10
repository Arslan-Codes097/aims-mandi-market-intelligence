# AMIS Data Unlocker: Proposal & Execution Roadmap

## 1. The Core Problem
Punjab's Agriculture Marketing Information Service (AMIS) has 20 years of official mandi price data — daily min/max/FQP prices and arrival quantities across every major market in the province. It's real, it's government-verified, and it's completely unusable because it sits behind a 2006-era ASP.NET site with no API, no historical charting worth using, and no way to ask it a real question. Meanwhile, the people who actually need this data — small farmers, traders, wholesalers — have no access to smartphones-with-good-UX or the patience to navigate a government website. 

The information exists. The access layer doesn't. 

**The Pitch:** We are not collecting new data, we are unlocking data that already exists but is functionally dead.

---

## 2. Product Layers
1. **Data Pipeline (The Moat):** Scrape AMIS daily (all commodities, all cities), normalize into a clean schema, and store historically. Includes live Fuel Price scraping to calculate accurate logistics costs.
2. **Intelligence Layer:** Compute real insights from historical time series:
   - **Trend direction:** Rising, falling, or stable per commodity per market.
   - **Cross-city price gaps:** Arbitrage signals with true Net Margins based on real-world Diesel travel costs.
   - **Volatility score:** Which commodities are unstable right now.
   - **Seasonal pattern detection:** Historical spikes and drops.
   - **Anomaly flagging:** Price breaks outside the recent trend (supply shock, hoarding, bad data).
3. **Access Layer:** Tool-calling AI agent for natural language querying. Translates human language ("tamatar rate Sahiwal aaj") into a structured query against the database.
4. **Web Dashboard:** A Next.js dashboard with charts, city comparisons, and commodity trend history for power users, researchers, and journalists.

---

## 3. Tech Stack
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Scraper** | Python (requests/BeautifulSoup or Playwright) | Handles AMIS ASP.NET postback forms. |
| **Scheduler** | GitHub Actions Cron | Free, version-controlled automation for daily scraping. |
| **Database** | Postgres (via Supabase) | Time-series friendly; handles Auth/RLS. |
| **Backend/API** | FastAPI | Built for async I/O, native Pydantic validation for structured LLM outputs, auto-generates API docs. |
| **Anomaly/Trend Logic** | Python (pandas, numpy, scipy) | Standard, honest, explainable ML/stats. |
| **NL Query Parsing** | Groq (Llama/GPT-OSS models) | Fast structured JSON output for tool calling. |
| **Frontend Dashboard** | Next.js + Tailwind + Recharts | Clean UI for data visualization. |
| **Hosting** | Vercel (Frontend) + Render/Railway (Backend) | Proven, low-friction deployment. |

---

## 4. Feature Scope

### Essentials (v1)
- Scraper (ASP.NET postback handling)
- Database (Postgres)
- Trend engine & anomaly detection
- Arbitrage engine (with live Fuel Logistics tracking) & sell/hold advisory
- Web dashboard
- Tool-calling agent (Groq)
- Persistent user memory (preferences)

### Wishlist (v2 & Beyond)
- WhatsApp bot / Voice assistant
- Price forecasting (Prophet/ARIMA)
- Weekly public reports/infographics
- Data quality flagging
- Public API for developers

---

## 5. Execution Roadmap & Contracts

This roadmap uses a **contract-first approach**. Nobody writes feature code until the database schema and function signatures are locked.

### Phase 0: Contracts (Day 1)
**Both Person A & Person B together**

**1. Database Schema:**
- `prices` `(id, commodity, city, date, min_price, max_price, fqp, arrival_quantity, scraped_at)`
- `fuel_prices` `(date, diesel_price, created_at)`
- `users` `(id, created_at)`
- `user_preferences` `(user_id, preferred_cities[], preferred_commodities[], watchlist[])`

**2. Function/API Contracts (Signatures & Output Shapes):**
- `get_trend(commodity, city, days)` -> `{direction, pct_change, data_points[]}`
- `get_anomaly(commodity, city, date)` -> `{is_anomaly, z_score, expected_range}`
- `get_arbitrage(commodity, distance_km)` -> `{best_buy_city, best_sell_city, gross_margin, net_margin, travel_cost, prices_by_city[]}`
- `get_advisory(commodity, city)` -> `{recommendation, reasoning, confidence}`

---

### Phase 1: Parallel Core Build (Days 2-5)

**Person A (Data & Intelligence):**
- **Day 2-3:** Scraper for AMIS & Fuel. Navigate the ASP.NET postback forms, write to DB on schedule (manually triggered at first). 
  - *Risk Check:* If the scraper isn't producing real data by end of Day 3, Person B drops their tasks to help unblock this.
- **Day 3-4:** Implement trend + anomaly logic against the agreed function signatures using Pandas/Scipy.
- **Day 4-5:** Build Arbitrage engine (integrating fuel costs), followed by Advisory logic. Write robust automated tests.

**Person B (Interface & Agent):**
- **Day 2-3:** Set up FastAPI skeleton. Create endpoints matching the agreed contracts and wire them to **mocked data** that exactly matches the agreed output shape.
- **Day 3-4:** Tool-calling agent. Define tools (mapped 1:1 to Person A's functions), wire up Groq for query parsing -> tool selection -> response.
- **Day 4-5:** Implement persistent memory (preferences table) and wire into the agent for contextual understanding (e.g., "my usual city").

---

### Phase 2: Integration (Day 6)
**Both Person A & Person B**
- Swap Person B's mocked functions for Person A's real ones.
- **Rule:** If a function's real output doesn't match the agreed shape, fix the mismatch. Do not redesign the feature or renegotiate the interface at this stage.

---

### Phase 3: Dashboard + Polish (Day 7 onward)
**Focus shifts to frontend**
- Build the Next.js dashboard consuming the now-working FastAPI backend.
- Implement charts, city comparison, arbitrage view, and the query box wired to the agent.
- *Note:* This is deliberately last. Dashboard polish has zero value if the backend intelligence layer isn't functional.

---

### Phase 4: Future AI Improvements (Billion-Dollar Features)
Once the core platform is stable, the following advanced AI features will be integrated to eliminate middlemen and increase accessibility:

**1. Computer Vision (Crop Grading & Disease Detection)**
- **Concept:** A farmer takes a photo of their harvest (e.g., a crate of Tomatoes). The AI (via Gemini Vision) analyzes the photo to instantly grade the crop (Grade A, B, or C) and check for visible diseases.
- **Value:** Tells the farmer exactly which price bracket their crop belongs in, stopping middlemen from lying about crop quality to underpay them.

**2. Voice AI Agent (For Accessibility)**
- **Concept:** Many small-scale farmers cannot read complex dashboards or type queries. A voice assistant allows them to open the app and speak in Urdu/Punjabi (e.g., *"Aaj Lahore mandi mein pyaz ka kya rate hai?"*).
- **Value:** The AI translates the audio, triggers a backend tool call to our database, and speaks the exact price back out loud, making the platform accessible to 100% of the farming population.
