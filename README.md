# AEGIS-TRACE — Graph Traversal & Taint Engine

**SIH26183 — Real-Time Identification of Fraud-Linked Cryptocurrency Exchanges**

AEGIS-TRACE is the Graph Traversal and Taint Engine component of the AEGIS-Trace platform. It traces outgoing cryptocurrency transactions from a suspect wallet and builds a transaction graph to support blockchain fraud investigation.

## Features

- TRON blockchain transaction analysis
- TRC-20 USDT transaction tracing
- Constrained Breadth-First Search (BFS)
- Forward tracing up to 5 hops
- Minimum taint threshold of 10 USDT
- Transaction loop/cycle protection
- Known DEX and smart-contract filtering
- Verified VASP attribution
- NetworkX directed transaction graph
- Redis caching with in-memory fallback
- JSON investigation result
- SHA-256 evidence hash
- Separate Demo and Real analysis modes
- Real mode does not automatically fall back to Demo mode

## Technology Stack

- Python 3.12+
- NetworkX
- Requests
- TronGrid REST API
- Redis (optional)

## How It Works

The engine starts from a suspect TRON wallet and performs a constrained BFS traversal.

```text
Suspect Wallet
      |
      v
    Hop 1
      |
      v
    Hop 2
      |
      v
    Hop 3
      |
      v
    Hop 4
      |
      v
    Hop 5