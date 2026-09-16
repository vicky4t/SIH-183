# Product Requirements Document (PRD)

## Project Title
AEGIS-Trace: Real-Time Crypto Fraud Attribution & VASP Identification Platform

## 1. Objective
To provide Law Enforcement Agencies (LEAs) and cybercrime investigators (NCRP/I4C) with an automated tool that ingests a victim-reported suspect cryptocurrency wallet address, traces outbound funds across multiple hops in under 15 seconds, attributes the destination to a known Virtual Asset Service Provider (VASP/Exchange), and automatically generates an emergency asset-freeze notice.

## 2. Target Users
* Cyber Crime Police Officers & Investigating Officers (IOs).
* Indian Cyber Crime Coordination Centre (I4C) analysts.
* VASP / Crypto Exchange Compliance & Fraud Desks.

## 3. Scope & MVP Boundaries (Hackathon Target)
* **Supported Chains:** Tron (TRC-20 USDT - primary) and Ethereum (ERC-20 USDT / ETH).
* **Traversal Depth:** Up to 5 hops forward from the suspect address.
* **Taint Model:** Threshold filtering (ignore transactions < 10 USDT to defeat dusting noise).
* **Attribution:** Static database of 5,000+ known Indian and global exchange hot/deposit wallets.
* **Deliverables:** Visual graph rendering + Auto-generated Section 94 BNSS notice in PDF.

## 4. System Workflow & Data Flow
1. **Intake:** Investigator inputs Complaint ID, Victim Wallet, Suspect Wallet, and Incident Timestamp.
2. **Expansion:** Backend fetches outbound transfers via TronGrid/Etherscan.
3. **Attribution:** For every target address, match against the VASP entity registry.
4. **Resolution:** If a target matches a known exchange, terminate trace, mark as destination VASP, and return the trail.
5. **Dossier:** Compile audit log, compute SHA-256 hash, and render legal freeze requisition.

## 5. Success Metrics
* Trace completion time: < 15 seconds for a 5-hop search.
* 0 crashes when encountering high-degree contract wallets (DEX router filter).
* Exported legal notice accurately cites transaction hashes, timestamps, and destination addresses.