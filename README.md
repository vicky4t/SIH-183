# SHADOWTRACE

### Automated Blockchain Intelligence for Crypto-Fraud Investigation

SHADOWTRACE is a blockchain analytics platform designed to help investigators trace fraud-linked cryptocurrency funds from a victim-reported wallet address to related wallets, suspicious transaction patterns, and potential Exchange/VASP destinations.

> **Smart India Hackathon 2026 — Problem Statement: SIH26183**  
> Theme: Blockchain & Cybersecurity

---

## 🚀 Features

- Victim-reported wallet address intake
- Wallet address validation
- Automated multi-hop blockchain fund tracing
- Detection of suspicious patterns:
  - Fan-in
  - Fan-out
  - Layering
  - Peeling chains
  - Round trips
- Behavioral wallet clustering
- Exchange / VASP identification
- Risk scoring and alerts
- Investigator dashboard
- Interactive transaction graph
- Investigation report generation

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       SHADOWTRACE       │
                    │   Investigation System  │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
     ┌─────────────────┐                   ┌─────────────────┐
     │    FRONTEND     │                   │     BACKEND     │
     │     Next.js     │  REST API / HTTPS │     FastAPI     │
     │ Tailwind CSS    │ ◄────────────────►│ Python          │
     │ Cytoscape.js    │                   │ Redis + Celery  │
     └────────┬────────┘                   └────────┬────────┘
              │                                     │
              ▼                                     ▼
       ┌──────────────┐                    ┌──────────────────┐
       │    Vercel    │                    │      Render      │
       │   Deployment │                    │    Deployment    │
       └──────────────┘                    └────────┬─────────┘
                                                    │
                         ┌──────────────────────────┼─────────────────────┐
                         │                          │                     │
                         ▼                          ▼                     ▼
                  ┌─────────────┐            ┌─────────────┐       ┌─────────────┐
                  │ PostgreSQL  │            │ Blockchain  │       │ VASP / Label│
                  │ / Timescale │            │ APIs / RPC  │       │   Matching  │
                  └─────────────┘            └─────────────┘       └─────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- Next.js
- Tailwind CSS
- Cytoscape.js
- JavaScript / TypeScript
- Deployed on **Vercel**

### Backend

- Python
- FastAPI
- Redis
- Celery for asynchronous/background tasks
- NetworkX for graph-based analysis
- Deployed on **Render**

### Database

- PostgreSQL
- TimescaleDB where required
- Neo4j / in-memory graph processing can be used for graph analysis

### Blockchain / External APIs

- Etherscan
- BscScan
- TronGrid RPC
- Alchemy
- Other supported blockchain RPC/API providers

### Development & Deployment

- GitHub
- Docker
- Vercel — Frontend
- Render — Backend

---

## 📁 Suggested Project Structure

```text
SIH-183/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   └── .env.local
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── tracing/
│   │   └── clustering/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── README.md
└── docker-compose.yml
```

> Adjust the folder names above to match the actual repository structure.

---

# ⚙️ Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/vicky4t/SIH-183.git
cd SIH-183
```

## 2. Create your own branch

Never work directly on the `main` branch.

```bash
git checkout -b feature/your-feature-name
```

---

# 🎨 Frontend Setup

Move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

# 🔧 Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the backend environment file:

```text
.env
```

Example:

```env
DATABASE_URL=your_postgresql_connection_string
REDIS_URL=your_redis_connection_string

ETHERSCAN_API_KEY=your_api_key
BSCSCAN_API_KEY=your_api_key
ALCHEMY_API_KEY=your_api_key
TRONGRID_API_KEY=your_api_key
```

Run FastAPI:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# ☁️ Deployment

## Frontend — Vercel

The Next.js frontend is deployed on **Vercel**.

### Steps

1. Push the frontend code to GitHub.
2. Open Vercel.
3. Import the GitHub repository.
4. Select the frontend directory as the project root if the repository contains separate frontend/backend folders.
5. Configure the required environment variables.
6. Deploy.

Frontend environment variable:

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com
```

After deployment:

```text
User
  ↓
Vercel
  ↓
Next.js Frontend
```

---

## Backend — Render

The FastAPI backend is deployed on **Render**.

### Steps

1. Push the backend code to GitHub.
2. Create a new Web Service on Render.
3. Select the GitHub repository.
4. Select the backend directory if required.
5. Configure the Python environment.
6. Add environment variables.
7. Deploy.

Example start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Backend deployment:

```text
User Request
     ↓
Vercel Frontend
     ↓
HTTPS API Request
     ↓
Render FastAPI Backend
     ↓
Blockchain APIs / Database / Analysis Engine
     ↓
Response
     ↓
Vercel Frontend
```

---

# 🔐 Environment Variables

**Never commit API keys, passwords, database credentials, or secret tokens to GitHub.**

Use:

- `.env` for backend secrets
- `.env.local` for local frontend variables
- Vercel Environment Variables for frontend deployment
- Render Environment Variables for backend deployment

Add these files to `.gitignore`:

```text
.env
.env.local
.env.*.local
venv/
__pycache__/
node_modules/
```

---

# 🔄 Application Workflow

```text
Victim Reports Wallet Address
             ↓
      Wallet Validation
             ↓
     Blockchain Tracing
             ↓
       Multi-Hop Analysis
             ↓
   ┌─────────┴─────────┐
   ↓                   ↓
Pattern Detection   Wallet Clustering
   │                   │
   └─────────┬─────────┘
             ↓
      Exchange / VASP
       Identification
             ↓
        Risk Scoring
             ↓
      Investigator Alert
             ↓
     Visual Investigation
           Report
```

---

# 🔌 API Communication

The frontend communicates with the backend through HTTPS REST APIs.

Example:

```text
Frontend (Vercel)
        |
        | POST /api/trace
        |
        ▼
Backend (Render)
        |
        | Blockchain API / Database
        |
        ▼
     Analysis
        |
        ▼
 JSON Response
        |
        ▼
Frontend Dashboard
```

Example request:

```json
{
  "wallet_address": "VICTIM_WALLET_ADDRESS",
  "network": "ethereum"
}
```

Example response:

```json
{
  "status": "completed",
  "risk_level": "high",
  "wallet_address": "VICTIM_WALLET_ADDRESS",
  "related_wallets": [],
  "exchange_matches": [],
  "patterns": []
}
```

The exact request and response structure should be updated according to the implemented backend API.

---

# 🧪 Development Workflow

Each team member should work on a separate branch.

```bash
git checkout -b feature/my-feature
```

After making changes:

```bash
git add .
git commit -m "Add wallet tracing feature"
git push origin feature/my-feature
```

Then create a Pull Request on GitHub.

### Important

```text
❌ Do not directly push to main.

✅ Create a branch.
✅ Make changes.
✅ Push your branch.
✅ Create a Pull Request.
✅ Review and merge into main.
```

---

# 📊 Core Analysis Pipeline

SHADOWTRACE is designed around the following analysis stages:

1. **Wallet Validation**  
   Validate the victim-reported wallet and blockchain/network.

2. **Fund Tracing**  
   Follow transactions across multiple hops.

3. **Pattern Detection**  
   Identify behaviors such as fan-in, fan-out, layering, peeling and round-trip movement.

4. **Wallet Clustering**  
   Group wallets using behavioral and transaction relationships.

5. **Exchange / VASP Matching**  
   Compare discovered addresses against known/labeled address information.

6. **Risk Assessment**  
   Generate a risk level and relevant alerts based on detected evidence.

7. **Investigator Report**  
   Present the transaction path, detected patterns, wallet relationships and alerts through the dashboard.

---

# ⚠️ Disclaimer

SHADOWTRACE is a prototype developed for **Smart India Hackathon 2026**.

Blockchain analytics can provide evidence and relationships between on-chain addresses, but an address or transaction pattern alone should not automatically be treated as proof of criminal activity or real-world identity.

Final investigation and attribution should be performed by authorized investigators using appropriate evidence and procedures.

---

# 👥 Team

**Team:** OSCAR-WINNERS  
**Problem Statement:** SIH26183  
**Project:** SHADOWTRACE

### Team Roles

- Prashant Girge — DevOps / Web3
- Misba Shaikh — System Design / Research
- Mansi Thorat — AI / ML
- Dnyaneshwar Kardile — UI/UX / Frontend
- Gaurav Kale — Cybersecurity / Backend
- Omkar Lakde — Python / RAG

---

## 📚 Research Basis

The project documentation references research and resources related to blockchain address clustering, cryptocurrency tracing, crypto-forensics, blockchain APIs and Indian cybercrime reporting.

The research material supplied with the project notes that public blockchain ledgers can enable transaction-flow analysis and that clustering/tagging techniques can be used to associate blockchain addresses with entities or services. fileciteturn0file0L101-L112

The SHADOWTRACE project proposal specifies Next.js/Tailwind/Cytoscape.js for the frontend, FastAPI/Redis/Celery for the backend, PostgreSQL/graph processing for data analysis, and Vercel/Render/Docker for deployment. fileciteturn0file1L94-L155

---

## ⭐ Project Goal

> **From one victim-reported wallet address to an investigator-ready view of the fund flow.**

SHADOWTRACE aims to reduce the manual effort required to investigate fraud-linked cryptocurrency transactions by combining blockchain tracing, pattern detection, wallet clustering and Exchange/VASP matching in one investigation workflow.
