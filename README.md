# 🎬 AMIS Mandi Market Intelligence

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Groq](https://img.shields.io/badge/AI_Agent-Groq_Llama-f55036?style=for-the-badge)
![Copyright](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)

**AMIS Mandi Market Intelligence** unlocks 20 years of Punjab's Agriculture Marketing Information Service (AMIS) data. It transforms a legacy government database into an intelligent, AI-powered platform featuring historical charting, live logistics-aware arbitrage detection, and a natural language tool-calling agent designed for farmers, traders, and researchers.

---

## 🌐 Live Product Environments

- **Web Application:** [https://aims-orcin.vercel.app/](https://aims-orcin.vercel.app/)
- **Backend API Server:** [https://aims-wpuy.onrender.com/api/](https://aims-wpuy.onrender.com/api/)
- **Demo Video:** *Placeholder for demo video (docs/assets/demo.mp4)*

---

## 📸 Platform Interface

| Settings Configuration | AI Tool-Calling Agent |
| :---: | :---: |
| <img src="docs/assets/settings.png" width="400" alt="Settings Configuration"/> | <img src="docs/assets/ai_agent.png" width="400" alt="AI Agent"/> |
| **Commodity Analysis** | **Live Arbitrage Margins** |
| <img src="docs/assets/commodity_analysis.png" width="400" alt="Commodity Analysis"/> | <img src="docs/assets/arbitrage.png" width="400" alt="Live Arbitrage"/> |

---

## ✨ Core Product Features

- **📊 Historical Data Pipeline:** Automated daily scraping of AMIS and fuel prices, normalizing unstructured legacy data into clean time-series metrics.
- **🧠 AI Tool-Calling Agent:** Chat interface powered by Groq that translates natural human language (e.g., *"tamatar rate Sahiwal aaj"*) into structured database queries.
- **📈 Trend & Anomaly Detection:** Compute real insights including rising/falling directions, volatility scores, and unexpected price shocks.
- **🚛 Logistics-Aware Arbitrage:** Cross-city price gap detection with true Net Margins calculated using real-world diesel travel costs.
- **🧠 Persistent User Memory:** Saves preferred cities and commodities securely via Custom Django JWT Auth for deeply contextual AI query understanding.

---

## 🛠️ Enterprise Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js, Tailwind, Zustand | Interactive web dashboard, state management, and PWA |
| **Backend API** | Django REST Framework | Secure REST endpoints, JWT authentication, and AI orchestration |
| **Database** | PostgreSQL (Supabase) | Time-series storage and relational models |
| **AI / LLM** | Groq (Llama / GPT-OSS) | Fast structured JSON output for NL tool-calling |
| **Data Engine** | Pandas, Numpy, Scipy | Trend, statistical analysis, and ML logic |
| **Scraper** | BeautifulSoup, Requests | Handling legacy ASP.NET postback forms |

---

## ⚙️ System Workflow

1. **Data Ingestion:** Automated GitHub Actions run daily scrapers to extract min/max/FQP prices from the AMIS ASP.NET portal and fetch live diesel prices, writing them to PostgreSQL.
2. **Data Processing:** Pandas and SciPy scripts calculate moving averages, historical anomalies, and true arbitrage margins based on geographical distances and fuel costs.
3. **User Query:** A user types a natural language question into the Next.js dashboard.
4. **Agentic Routing:** The Groq-powered AI agent parses the intent, selects the appropriate backend tool (e.g., `get_trend`, `get_arbitrage`), and executes the structured query.
5. **Insights Delivery:** The backend executes the logic and the frontend renders the response alongside interactive charts.

---

## 🏗️ Cloud Architecture

```mermaid
graph TD
    A[User / Farmer] -->|Natural Language Query| B(Next.js PWA Frontend)
    B -->|REST API / JWT Auth| C(Django Backend)
    C <-->|NL Parsing & Tool Selection| D[Groq AI Agent]
    C <-->|SQL Queries| E[(Supabase PostgreSQL)]
    F[GitHub Actions] -->|Daily Scraper Workflow| E
    F -->|Scrapes ASP.NET Form| G[Punjab AMIS Portal]
    F -->|Scrapes Logistics| H[Live Fuel Prices]
```

---

## © Copyright & License

**Proprietary Software**  
© 2026 AMIS Mandi Market Intelligence. All Rights Reserved.  
*This software is the confidential and proprietary product of its creators. No part of this repository may be reproduced, distributed, or transmitted in any form or by any means, including copying, compiling, or reverse engineering, without the prior written permission of the authors.*

---

## 👤 Founders & Credits

- **Arslan Babar** - [@Arslan-Codes097](https://github.com/Arslan-Codes097)
- **Samama Zaid** - [@s-zaid-13](https://github.com/s-zaid-13)
