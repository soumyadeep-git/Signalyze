# Fello AI — Account Intelligence & Enrichment System

An AI-powered system that converts raw website visitor signals or company names into structured, sales-ready account intelligence using a multi-agent LangGraph pipeline.

Built for the **Fello AI Builder Hackathon**.

---

## What It Does

| Input | Output |
|-------|--------|
| Company name (e.g. "Rocket Mortgage") | Full company profile, tech stack, leadership, business signals, AI summary, recommended sales actions |
| Website visitor signals (IP, pages, behavior) | Company identification + persona inference + intent scoring + everything above |
| CSV batch of companies | Concurrent analysis of all companies |

### Key Features

- **Multi-Agent AI Pipeline** — 7 specialized LangGraph agents run in parallel (not sequential calls)
- **Real-Time Agent Visualization** — see each agent's status as the pipeline executes
- **Company Enrichment** — industry, size, HQ, founding year, description, website
- **Technology Stack Detection** — CRM, marketing automation, analytics, frameworks via HTML analysis + AI inference
- **Leadership Discovery** — CEO, VP Sales, CTO, RevOps leaders from web research
- **Buyer Intent Scoring** — weighted behavioral scoring (0-10) with stage classification
- **Persona Inference** — maps page visits to likely job role with confidence
- **Business Signals** — hiring, funding, expansion, partnerships from news
- **AI Summary & Actions** — LLM-generated intelligence brief + specific sales recommendations
- **Batch Processing** — analyze multiple companies concurrently with CSV upload
- **Caching** — SQLite cache avoids redundant API calls

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Input   │ │  Agent   │ │ Results  │ │ Batch  │ │
│  │  Forms   │ │ Pipeline │ │Dashboard │ │ Upload │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└────────────────────┬────────────────────────────────┘
                     │ REST + SSE
┌────────────────────▼────────────────────────────────┐
│                FastAPI Backend                       │
│  ┌───────────────────────────────────────────────┐  │
│  │            LangGraph Orchestrator             │  │
│  │                                               │  │
│  │  ┌─────────────┐                              │  │
│  │  │ Identify    │──┐                           │  │
│  │  │ (IP/Search) │  │                           │  │
│  │  └─────────────┘  │  ┌──────────┐             │  │
│  │                   ├──│ Enrich   │──┐          │  │
│  │  ┌─────────────┐ │  └──────────┘  │          │  │
│  │  │ Set Company │─┤  ┌──────────┐  │          │  │
│  │  │ (direct)    │ ├──│Tech Stack│──┤          │  │
│  │  └─────────────┘ │  └──────────┘  │ ┌──────┐ │  │
│  │                  ├──┌──────────┐  ├─│Synth │ │  │
│  │                  │  │Leadership│──┤ │Agent │ │  │
│  │                  │  └──────────┘  │ └──────┘ │  │
│  │                  ├──┌──────────┐  │          │  │
│  │                  │  │ Intent   │──┤          │  │
│  │                  │  └──────────┘  │          │  │
│  │                  └──┌──────────┐  │          │  │
│  │                     │ Persona  │──┘          │  │
│  │                     └──────────┘             │  │
│  └───────────────────────────────────────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ DuckDuckGo │ │ ip-api.com │ │Web Scraper │      │
│  │  Search    │ │  Geo/Org   │ │ + Wappalyze│      │
│  └────────────┘ └────────────┘ └────────────┘      │
└─────────────────────────────────────────────────────┘
```

### Agent Pipeline

| # | Agent | Purpose | Data Sources |
|---|-------|---------|-------------|
| 1 | **Identification** | Resolve company from IP/behavior | ip-api.com, DuckDuckGo |
| 2 | **Enrichment** | Build company profile | Web search, website scraping |
| 3 | **Tech Stack** | Detect technologies | Website HTML signatures + AI |
| 4 | **Leadership** | Find decision-makers | Web search + AI extraction |
| 5 | **Intent** | Score buying intent (0-10) | Behavioral signals + AI |
| 6 | **Persona** | Infer visitor role | Page-to-persona mapping + AI |
| 7 | **Synthesis** | Generate summary + actions | All agent outputs + news |

Agents 2-6 execute **in parallel** after identification, then feed into Synthesis.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Lucide icons, Recharts |
| Backend | FastAPI, LangGraph, LangChain |
| LLM | Groq (Llama 3.3 70B — blazing fast inference) |
| Search | DuckDuckGo (free, no API key) |
| IP Lookup | ip-api.com (free) |
| Tech Detection | BeautifulSoup + Wappalyzer-style signatures |
| Caching | SQLite |
| Deployment | Docker Compose, Railway |

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Groq API key ([free at console.groq.com](https://console.groq.com))

### 1. Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/fello-ai.git
cd fello-ai
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 2. Run with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 3. Run Without Docker (Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Analyze a single company or visitor |
| `POST` | `/analyze/stream` | SSE stream with agent progress events |
| `POST` | `/analyze/batch` | Analyze multiple companies concurrently |
| `GET` | `/history` | View past analyses |
| `GET` | `/health` | Health check |

### Example Request

```json
{
  "input_type": "company",
  "company": {
    "company_name": "Rocket Mortgage",
    "domain": "rocketmortgage.com"
  }
}
```

### Example Visitor Request

```json
{
  "input_type": "visitor",
  "visitor": {
    "visitor_id": "001",
    "ip": "34.201.10.50",
    "pages_visited": ["/pricing", "/ai-sales-agent", "/case-studies"],
    "time_on_site": "3m 42s",
    "visits_this_week": 3,
    "referral_source": "google",
    "device": "Desktop",
    "location": "New York"
  }
}
```

---

## Example Output

```json
{
  "company_identification": {
    "company_name": "Rocket Mortgage",
    "domain": "rocketmortgage.com",
    "confidence": 1.0
  },
  "company_profile": {
    "company_name": "Rocket Mortgage",
    "industry": "Mortgage Lending / Fintech",
    "company_size": "3,000+ employees",
    "headquarters": "Detroit, Michigan, USA",
    "founding_year": "1985",
    "description": "Rocket Mortgage is America's largest mortgage lender..."
  },
  "tech_stack": [
    {"category": "Analytics", "technology": "Google Analytics", "confidence": 0.95},
    {"category": "CRM", "technology": "Salesforce", "confidence": 0.7}
  ],
  "leadership": [
    {"name": "Varun Krishna", "title": "CEO", "confidence": 0.9}
  ],
  "intent": {
    "score": 8.4,
    "stage": "Evaluation",
    "signals": ["Visited /pricing (+3.0)", "Visited /case-studies (+2.0)"]
  },
  "persona": {
    "likely_persona": "Head of Sales Operations",
    "confidence": 0.72
  },
  "ai_summary": "Rocket Mortgage is a major fintech lender showing strong interest...",
  "recommended_actions": [
    "Research VP Sales or RevOps leaders at Rocket Mortgage",
    "Send personalized outreach referencing mortgage industry case studies"
  ]
}
```

---

## Design Decisions

1. **LangGraph over sequential chains** — Enables true parallel agent execution. Enrichment, Tech Stack, Leadership, Intent, and Persona agents all run concurrently after company identification.

2. **Groq for speed** — Llama 3.3 70B on Groq hardware delivers sub-second inference, making the multi-agent pipeline complete in ~10-15 seconds total instead of minutes.

3. **Zero external API keys** — Beyond Groq, every data source is free: DuckDuckGo search, ip-api.com, direct website scraping. No Clearbit, no ZoomInfo, no paid enrichment APIs.

4. **Behavioral intent scoring** — Combines deterministic weighted scoring (page types, visit frequency, dwell time) with LLM reasoning for nuanced intent classification.

5. **Wappalyzer-style tech detection** — Scans website HTML for 30+ technology signatures before sending to LLM for augmented analysis.

6. **SQLite caching** — Avoids redundant API calls and LLM inference for recently analyzed companies.

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI routes + SSE streaming
│   │   ├── config.py            # Pydantic settings
│   │   ├── models/schemas.py    # Request/response models
│   │   ├── agents/
│   │   │   ├── graph.py         # LangGraph orchestrator
│   │   │   ├── identification.py
│   │   │   ├── enrichment.py
│   │   │   ├── tech_stack.py
│   │   │   ├── leadership.py
│   │   │   ├── intent.py
│   │   │   ├── persona.py
│   │   │   └── synthesis.py
│   │   └── services/
│   │       ├── ip_lookup.py     # ip-api.com
│   │       ├── web_search.py    # DuckDuckGo
│   │       ├── scraper.py       # BeautifulSoup + tech detection
│   │       └── cache.py         # SQLite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/page.tsx         # Main dashboard
│   │   ├── components/          # UI components
│   │   └── lib/api.ts           # API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## License

MIT
