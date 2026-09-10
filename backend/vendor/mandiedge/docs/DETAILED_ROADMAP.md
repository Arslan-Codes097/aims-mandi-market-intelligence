# Detailed Execution Roadmap

This is the step-by-step, actionable roadmap for both team members. 
**Person A** (You) is responsible for the Data Pipeline and Intelligence Layer.
**Person B** (Your Partner) is responsible for the API, AI Agent, and Frontend Dashboard.

Before starting, ensure both of you have agreed on the **Database Schema** and **Function Signatures** outlined in the initial proposal. 

---

## 👨‍💻 Person A: Data & Intelligence (The Engine)
Your goal is to extract the data, store it reliably, and write the Python logic to generate insights.

### Step A.1: Crack the Scraper (Days 1-2)
The AMIS website uses old ASP.NET forms (`__VIEWSTATE` and `__EVENTVALIDATION`). You can't just fetch a simple URL.
1. **Inspect Network Requests:** Open the AMIS site, change a dropdown (e.g., City), and watch the Network tab to see the form data being posted.
2. **Choose the Tool:** 
   - *Option 1 (Faster but harder to debug):* Use `requests` and `BeautifulSoup`. You must manually extract the hidden viewstate tokens from the HTML and include them in your POST requests.
   - *Option 2 (Easier but heavier):* Use `Playwright` to literally automate a headless browser that clicks the dropdowns and reads the tables.
3. **Write the Script:** Build a Python script that successfully fetches yesterday's price for *one* commodity in *one* city.
4. **Scale It:** Add loops to iterate over all major cities and commodities. Save the output to a local CSV or JSON file temporarily to prove it works.

### Step A.2: Database Integration (Day 3)
1. **Set up Supabase:** Create a new Supabase project.
2. **Create the Table:** Execute the SQL to create the `prices` table `(id, commodity, city, date, min_price, max_price, fqp, arrival_quantity)`.
3. **Connect the Scraper:** Update your Python scraper to use the `supabase-py` library. Instead of saving to a CSV, insert the scraped records directly into your Postgres database.

### Step A.3: Build the Intelligence Functions (Day 4)
Write standard Python functions that query your Supabase database using `pandas` and `scipy`.
1. **`get_trend(commodity, city, days)`:** Fetch the last X days of data for the commodity/city. Calculate the percentage change and determine if the direction is 'rising', 'falling', or 'stable'.
2. **`get_arbitrage(commodity)`:** Fetch today's prices for a commodity across *all* cities. Find the city with the lowest price and the city with the highest price. Calculate the potential profit margin.
3. **`get_anomaly(commodity, city, date)`:** Fetch the last 30 days of data. Calculate the mean and standard deviation. If today's price is more than 2 standard deviations away from the mean (Z-score > 2), flag it as an anomaly.
4. **`get_advisory(commodity, city)`:** Combine trend and anomaly data into a simple rule-based recommendation (e.g., "Price is dropping fast, hold your stock").

### Step A.4: Automate the Pipeline (Day 5)
1. Push your scraper code to GitHub.
2. Create a `.github/workflows/scrape.yml` file. Configure a Cron job to run your Python script every day at 11:00 PM (or whenever AMIS updates). 

---

## 👨‍💻 Person B: Interface & Agent (The Access Layer)
Your goal is to build the API, wire up the AI agent to understand user questions, and create the visual dashboard.

### Step B.1: The Mock API (Days 1-2)
*Do not wait for Person A to finish the real database.*
1. **Initialize FastAPI:** Create a new FastAPI project. 
2. **Create Mock Functions:** Write dummy Python functions that return hardcoded data in the exact JSON shape you both agreed upon.
   - Example: `mock_get_trend()` returns `{"direction": "rising", "pct_change": 12.5}`.
3. **Create Endpoints:** Build the API routes (e.g., `GET /api/trend`) that return the results of these mock functions. 

### Step B.2: The AI Agent (Day 3)
This is where the magic happens. The LLM won't answer questions itself; it will use your API.
1. **Setup Groq:** Install the Groq SDK and get an API key.
2. **Define Tools:** Tell the LLM about your mocked functions using JSON Schema. Explain to the LLM what `get_trend` does and what arguments (`commodity`, `city`) it needs.
3. **The Chat Endpoint:** Create a `POST /api/chat` endpoint.
   - It receives a message: "What is the tomato rate in Lahore?"
   - Sends it to Groq.
   - Groq replies: *I need to call the `get_trend` tool with `commodity=tomato` and `city=Lahore`.*
   - Your FastAPI code executes the mocked `get_trend` function.
   - You send the result back to Groq, which formulates a natural language reply: "The tomato rate in Lahore is currently rising..."

### Step B.3: The Web Dashboard (Days 4-5)
1. **Initialize Next.js:** Create a Next.js (App Router) project with TailwindCSS.
2. **Build the Chat UI:** Create a WhatsApp-style chat interface where the user can type questions and talk to your FastAPI `/api/chat` endpoint.
3. **Build the Visual Dashboard:** Create a dashboard page for power users. Use `Recharts` or `Chart.js` to draw line graphs. Fetch data from your FastAPI endpoints to populate these charts.

---

## 🤝 Integration & Polish (Day 6-7)
**Both Persons Together**
1. **Swap the Engine:** Person B deletes their `mock_get_trend` functions and imports Person A's *real* `get_trend` functions that talk to the actual database. 
2. **Test:** Ask the AI agent a question. It should now fetch real, live data scraped by Person A.
3. **Deploy:** 
   - Person B deploys the Next.js frontend to **Vercel**.
   - Person B deploys the FastAPI backend to **Render** or **Railway**.
