# 🎬 AMIS Mandi Market Intelligence

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Groq](https://img.shields.io/badge/AI_Agent-Groq_Llama-f55036?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**AMIS Mandi Market Intelligence** unlocks 20 years of Punjab's Agriculture Marketing Information Service (AMIS) data. It transforms a legacy government database into an intelligent, AI-powered platform featuring historical charting, live logistics-aware arbitrage detection, and a natural language tool-calling agent designed for farmers, traders, and researchers.

---

## 🌐 Live Demo & Media

- **Live App:** [View Dashboard on Vercel](https://aims-mandi-market-intelligence-git-main-arslan-s-projects14.vercel.app)
- **Demo Video:** *Placeholder for demo video (docs/assets/demo.mp4)*

---

## 📸 Screenshots

| Dashboard Overview | AI Tool-Calling Agent |
| :---: | :---: |
| <img src="docs/assets/dashboard.png" width="400" alt="Dashboard Overview"/> | <img src="docs/assets/ai_agent.png" width="400" alt="AI Agent"/> |
| **Commodity Analysis** | **Live Arbitrage Margins** |
| <img src="docs/assets/commodity_analysis.png" width="400" alt="Commodity Analysis"/> | <img src="docs/assets/arbitrage.png" width="400" alt="Live Arbitrage"/> |

*(Note: Add actual screenshots to the `docs/assets/` folder)*

---

## ✨ Key Features

- **📊 Historical Data Pipeline:** Automated daily scraping of AMIS and fuel prices, normalizing unstructured legacy data into clean time-series metrics.
- **🧠 AI Tool-Calling Agent:** Chat interface powered by Groq that translates natural human language (e.g., *"tamatar rate Sahiwal aaj"*) into structured database queries.
- **📈 Trend & Anomaly Detection:** Compute real insights including rising/falling directions, volatility scores, and unexpected price shocks.
- **🚛 Logistics-Aware Arbitrage:** Cross-city price gap detection with true Net Margins calculated using real-world diesel travel costs.
- **🔐 Persistent User Memory:** Saves preferred cities and commodities per user via Supabase Auth for contextual query understanding.

---

## 🛠️ Tech Stack Table

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js, Tailwind, Recharts | Interactive web dashboard and data visualization |
| **Backend API** | FastAPI / Django (Python) | Async endpoints, backend architecture |
| **Database** | PostgreSQL (Supabase) | Time-series storage, Auth, and Row Level Security |
| **AI / LLM** | Groq (Llama / GPT-OSS) | Fast structured JSON output for NL tool-calling |
| **Data Engine** | Pandas, Numpy, Scipy | Trend, statistical analysis, and ML logic |
| **Scraper** | BeautifulSoup, Requests | Handling legacy ASP.NET postback forms |

---

## ⚙️ How It Works

1. **Data Ingestion:** A scheduled Cron job scrapes daily min/max/FQP prices from the AMIS ASP.NET portal and live diesel prices, writing them to a Supabase PostgreSQL database.
2. **Data Processing:** Pandas and SciPy scripts calculate moving averages, historical anomalies, and true arbitrage margins based on geographical distances and fuel costs.
3. **User Query:** A user types a natural language question into the Next.js dashboard.
4. **Agentic Routing:** The Groq-powered AI agent parses the intent, selects the appropriate backend tool (e.g., `get_trend`, `get_arbitrage`), and executes the structured query.
5. **Insights Delivery:** The backend executes the logic and the frontend renders the response alongside interactive charts.

---

## 🏗️ Project Architecture

```mermaid
graph TD
    A[User / Farmer] -->|Natural Language Query| B(Next.js Frontend)
    B -->|REST API| C(Python Backend)
    C <-->|NL Parsing & Tool Selection| D[Groq AI Agent]
    C <-->|SQL Queries| E[(Supabase PostgreSQL)]
    F[Python Scraper] -->|Daily Cron Job| E
    F -->|Scrapes ASP.NET Form| G[Punjab AMIS Portal]
    F -->|Scrapes Logistics| H[Live Fuel Prices]
```

---

## 📂 Project Structure

```text
aims-mandi-market-intelligence/
├── frontend/                 # Next.js web dashboard
│   ├── src/app/              # App router (auth, dashboard)
│   ├── src/components/       # UI components & charts
│   └── package.json
├── backend/                  # Python backend server
│   ├── config/               # Settings and configuration
│   ├── apps/                 # Core logic, agent & scrapers
│   └── requirements.txt
└── README.md
```

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (or a Supabase account)

### 1. Clone the Repository
```bash
git clone https://github.com/s-zaid-13/aims-mandi-market-intelligence.git
cd aims-mandi-market-intelligence
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
*Create a `.env` file in the `backend` directory with your Groq and Supabase credentials, then run:*
```bash
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Setup (Next.js)
```bash
cd ../frontend
npm install
```
*Create a `.env.local` file in the `frontend` directory with your `NEXT_PUBLIC_API_URL`, then run:*
```bash
npm run dev
```

---

## 👤 Author & Credits

- **Arsalan Babar** - [@Arslan-Codes097](https://github.com/Arslan-Codes097)
- **Zaid** - [@s-zaid-13](https://github.com/s-zaid-13) (Partner & Original Repo Owner)
