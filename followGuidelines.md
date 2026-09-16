## Team Responsibilities

### Dev 1 gaurav — Blockchain Ingestion and Normalization
- **Responsibilities:** Create API wrappers for TronGrid and Etherscan. Convert transactions into a standard format containing `tx_hash`, `from`, `to`, `amount`, `token`, and `timestamp`.
- **Technology:** Python (`httpx`, `web3.py`) and TronWeb.

### Dev 2 mansi — Graph Traversal and Taint Engine
- **Responsibilities:** Implement constrained BFS traversal. Exclude smart-contract interactions such as DEX swaps and trace outgoing funds for up to five hops.
- **Technology:** Python (NetworkX) and Redis.

### Dev 3 prashant — Entity Attribution and VASP Database
- **Responsibilities:** Maintain a database of known exchange hot, cold, and deposit wallets for WazirX, CoinDCX, Binance, and KuCoin. Create endpoints for matching wallet addresses.
- **Technology:** PostgreSQL/Supabase and SQL.

### Dev 4 omkar — Backend API and Orchestration
- **Responsibilities:** Build the FastAPI application, background workers, authentication, and NCRP/SAHYOG complaint-ingestion endpoints.
- **Technology:** FastAPI, Celery, and Redis.

### Dev 5 mauli — Frontend UI and Interactive Graph
- **Responsibilities:** Build the incident dashboard, complaint-submission forms, and real-time node-graph visualizer.
- **Technology:** Next.js (TypeScript), Tailwind CSS, and Cytoscape.js.

### Dev 6 misba — Forensics Dossier and Legal Export
- **Responsibilities:** Generate legal PDF notices for law-enforcement agencies under Section 94 BNSS (formerly Section 91 CrPC), calculate SHA-256 evidence hashes, and prepare slide decks.
- **Technology:** Python (ReportLab/WeasyPrint) and Jinja2.



Backend setup:

Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000


Frontend setup:

Bash
cd frontend
npm install
npm run dev

Standardized Tech Stack & Contracts
Frontend: Next.js (React 19, TypeScript), Tailwind CSS, Cytoscape.js (canvas network rendering).

Backend: Python 3.12 with FastAPI (asynchronous, auto-generates OpenAPI docs).

Databases:

PostgreSQL: Stores NCRP complaints, chain metadata, and labeled entity addresses.

Redis: Caching transaction lookups to avoid RPC rate limits and queueing long traces.

Blockchain APIs: TronGrid REST API (Tron/TRC-20 USDT), Etherscan/BscScan REST APIs (Ethereum/BSC). No local archival nodes required.