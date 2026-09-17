"""
AEGIS-TRACE
Graph Traversal + Taint Engine
SIH26183

Real mode:
- TRON / TRC20 USDT
- Multi-hop constrained BFS (max 5 hops)
- DEX / contract filtering
- VASP attribution
- Redis cache with memory fallback
- JSON result
- SHA-256 evidence hash

IMPORTANT:
Never hard-code API keys. Set them as environment variables.
"""

from __future__ import annotations

import os
import re
import json
import hashlib
import time
from collections import deque
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set

import requests
import networkx as nx


# ============================================================
# CONFIG
# ============================================================

TRON_API = "https://api.trongrid.io"
TRON_TRX_API = f"{TRON_API}/v1/accounts/{{wallet}}/transactions/trc20"

TRON_USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

MAX_HOPS = 5
MIN_TAINT_USDT = 10.0
REQUEST_TIMEOUT = 20

TRON_API_KEY = os.getenv("TRON_PRO_API_KEY", "")
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", "")
BSCSCAN_API_KEY = os.getenv("BSCSCAN_API_KEY", "")

REDIS_URL = os.getenv("REDIS_URL", "")

OUTPUT_FILE = "taint_result.json"


# ============================================================
# VERIFIED VASP REGISTRY
# ============================================================
#
# IMPORTANT:
# Replace/add only addresses verified by your team.
#
# Format:
# "BLOCKCHAIN_ADDRESS": {
#     "name": "Exchange Name",
#     "type": "VASP",
#     "country": "..."
# }
#
# Do NOT put guessed/fake addresses here.
#

VASP_REGISTRY: Dict[str, Dict[str, str]] = {
    # Example structure only:
    #
    # "VERIFIED_ADDRESS_HERE": {
    #     "name": "Example Exchange",
    #     "type": "VASP",
    #     "country": "India"
    # }
}


# ============================================================
# KNOWN DEX / CONTRACT ADDRESSES
# ============================================================
#
# Add only verified contract/router addresses supplied by team.
#

DEX_CONTRACTS: Set[str] = set()


# ============================================================
# MEMORY CACHE
# ============================================================

_MEMORY_CACHE: Dict[str, Any] = {}


# ============================================================
# REDIS CACHE
# ============================================================

try:
    import redis

    _redis_client = None

    if REDIS_URL:
        try:
            _redis_client = redis.from_url(
                REDIS_URL,
                decode_responses=True
            )
            _redis_client.ping()
            print("[CACHE] Redis connected")
        except Exception as exc:
            _redis_client = None
            print(f"[CACHE] Redis unavailable: {exc}")
    else:
        print("[CACHE] REDIS_URL not configured; using memory cache")

except ImportError:
    redis = None
    _redis_client = None
    print("[CACHE] redis package not installed; using memory cache")


def cache_get(key: str) -> Optional[Any]:
    """Get JSON object from Redis or memory cache."""

    if _redis_client:
        try:
            value = _redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception:
            pass

    return _MEMORY_CACHE.get(key)


def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    """Store JSON object in Redis or memory cache."""

    if _redis_client:
        try:
            _redis_client.setex(
                key,
                ttl,
                json.dumps(value)
            )
            return
        except Exception:
            pass

    _MEMORY_CACHE[key] = value


# ============================================================
# VALIDATION
# ============================================================

def validate_tron_address(address: str) -> bool:
    """
    Basic TRON address format validation.

    A proper production system should additionally perform
    Base58Check validation.
    """

    if not isinstance(address, str):
        return False

    return bool(
        re.fullmatch(r"T[1-9A-HJ-NP-Za-km-z]{33}", address)
    )


def normalize_address(address: str) -> str:
    return address.strip()


# ============================================================
# HELPERS
# ============================================================

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_json(data: Any) -> str:
    raw = json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":")
    ).encode("utf-8")

    return hashlib.sha256(raw).hexdigest()


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


# ============================================================
# VASP LOOKUP
# ============================================================

def identify_vasp(address: str) -> Optional[Dict[str, str]]:
    """Check whether an address exists in verified VASP registry."""

    address = normalize_address(address)

    result = VASP_REGISTRY.get(address)

    if result:
        return {
            "address": address,
            **result
        }

    return None


# ============================================================
# DEX / CONTRACT FILTER
# ============================================================

def is_known_dex_or_contract(address: str) -> bool:
    """
    Returns True only for addresses explicitly supplied
    in the verified DEX_CONTRACTS registry.
    """

    return normalize_address(address) in DEX_CONTRACTS


# ============================================================
# TRON API
# ============================================================

def tron_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/json"
    }

    if TRON_API_KEY:
        headers["TRON-PRO-API-KEY"] = TRON_API_KEY

    return headers


def fetch_tron_transactions(
    wallet: str,
    limit: int = 200
) -> List[Dict[str, Any]]:
    """
    Fetch TRC20 USDT transactions involving wallet.

    For tracing, only outgoing transfers from the wallet
    are used by the BFS engine.
    """

    wallet = normalize_address(wallet)

    if not validate_tron_address(wallet):
        raise ValueError(
            f"Invalid TRON wallet address: {wallet}"
        )

    cache_key = (
        f"tron:trc20:usdt:"
        f"{wallet}:"
        f"{limit}"
    )

    cached = cache_get(cache_key)

    if cached is not None:
        return cached

    url = TRON_TRX_API.format(wallet=wallet)

    params = {
        "limit": min(limit, 200),
        "contract_address": TRON_USDT,
        "order_by": "block_timestamp,desc"
    }

    response = requests.get(
        url,
        params=params,
        headers=tron_headers(),
        timeout=REQUEST_TIMEOUT
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"TRON API error "
            f"{response.status_code}: "
            f"{response.text[:500]}"
        )

    payload = response.json()

    transactions = payload.get("data", [])

    cache_set(
        cache_key,
        transactions,
        ttl=300
    )

    return transactions


# ============================================================
# NORMALIZE TRON TRANSACTION
# ============================================================

def normalize_tron_transaction(
    tx: Dict[str, Any],
    source_wallet: str
) -> Optional[Dict[str, Any]]:
    """
    Convert TronGrid transaction into a common format.
    """

    from_addr = tx.get("from", "")
    to_addr = tx.get("to", "")

    if not from_addr or not to_addr:
        return None

    # Only outgoing transaction
    if from_addr != source_wallet:
        return None

    amount_raw = tx.get("value", 0)

    # TRC20 USDT normally uses 6 decimals
    amount = safe_float(amount_raw) / 1_000_000

    if amount < MIN_TAINT_USDT:
        return None

    tx_id = (
        tx.get("transaction_id")
        or tx.get("transactionHash")
        or tx.get("txID")
        or ""
    )

    block_timestamp = tx.get("block_timestamp")

    if block_timestamp:
        try:
            timestamp = datetime.fromtimestamp(
                int(block_timestamp) / 1000,
                tz=timezone.utc
            ).isoformat()
        except Exception:
            timestamp = None
    else:
        timestamp = None

    return {
        "tx_hash": tx_id,
        "from": from_addr,
        "to": to_addr,
        "amount_usdt": amount,
        "token": "USDT",
        "chain": "TRON",
        "timestamp": timestamp,
        "contract": tx.get("token_info", {}).get("address")
        if isinstance(tx.get("token_info"), dict)
        else TRON_USDT
    }


# ============================================================
# OUTGOING TRANSFERS
# ============================================================

def get_outgoing_transfers(
    wallet: str
) -> List[Dict[str, Any]]:
    """
    Fetch and normalize outgoing USDT transfers.
    """

    raw = fetch_tron_transactions(wallet)

    transfers = []

    for tx in raw:
        normalized = normalize_tron_transaction(
            tx,
            wallet
        )

        if normalized:
            transfers.append(normalized)

    return transfers


# ============================================================
# BFS TAINT ENGINE
# ============================================================

class TaintEngine:

    def __init__(
        self,
        max_hops: int = MAX_HOPS,
        min_taint: float = MIN_TAINT_USDT
    ):
        self.max_hops = max_hops
        self.min_taint = min_taint

        self.graph = nx.DiGraph()

        self.transactions: List[Dict[str, Any]] = []
        self.paths: List[List[str]] = []

        self.vasp_matches: List[Dict[str, Any]] = []
        self.exclusions: List[Dict[str, Any]] = []

        self.visited: Set[str] = set()

    # --------------------------------------------------------
    # BFS
    # --------------------------------------------------------

    def trace(
        self,
        source_wallet: str
    ) -> Dict[str, Any]:

        source_wallet = normalize_address(
            source_wallet
        )

        if not validate_tron_address(source_wallet):
            raise ValueError(
                f"Invalid TRON wallet address: {source_wallet}"
            )

        queue = deque()

        queue.append(
            (
                source_wallet,
                0,
                [source_wallet],
                0.0
            )
        )

        self.visited.add(source_wallet)

        self.graph.add_node(
            source_wallet,
            type="source",
            hop=0
        )

        while queue:

            current_wallet, hop, path, cumulative_amount = (
                queue.popleft()
            )

            # Stop at max hop
            if hop >= self.max_hops:
                continue

            try:
                transfers = get_outgoing_transfers(
                    current_wallet
                )

            except Exception as exc:

                self.exclusions.append({
                    "wallet": current_wallet,
                    "reason": "transaction_fetch_error",
                    "error": str(exc)
                })

                continue

            for tx in transfers:

                destination = tx["to"]

                # --------------------------------------------
                # DEX / CONTRACT FILTER
                # --------------------------------------------

                if is_known_dex_or_contract(destination):

                    self.exclusions.append({
                        "tx_hash": tx["tx_hash"],
                        "from": current_wallet,
                        "to": destination,
                        "reason": "known_dex_or_contract"
                    })

                    continue

                next_hop = hop + 1

                new_path = path + [destination]

                new_cumulative = (
                    cumulative_amount
                    + tx["amount_usdt"]
                )

                tx_record = {
                    **tx,
                    "hop": next_hop,
                    "taint_amount_usdt": tx["amount_usdt"],
                    "cumulative_taint_usdt": new_cumulative
                }

                self.transactions.append(
                    tx_record
                )

                # --------------------------------------------
                # GRAPH
                # --------------------------------------------

                self.graph.add_node(
                    destination,
                    type="wallet",
                    hop=next_hop
                )

                self.graph.add_edge(
                    current_wallet,
                    destination,
                    tx_hash=tx["tx_hash"],
                    amount_usdt=tx["amount_usdt"],
                    hop=next_hop
                )

                # --------------------------------------------
                # VASP
                # --------------------------------------------

                vasp = identify_vasp(destination)

                if vasp:

                    match = {
                        **vasp,
                        "hop": next_hop,
                        "tx_hash": tx["tx_hash"],
                        "amount_usdt": tx["amount_usdt"],
                        "source_wallet": source_wallet
                    }

                    self.vasp_matches.append(
                        match
                    )

                    self.paths.append(
                        new_path
                    )

                    # Stop tracing this branch when
                    # verified VASP is reached.
                    continue

                # --------------------------------------------
                # LOOP PROTECTION
                # --------------------------------------------

                if destination in new_path[:-1]:
                    self.exclusions.append({
                        "tx_hash": tx["tx_hash"],
                        "to": destination,
                        "reason": "cycle_detected"
                    })

                    continue

                # --------------------------------------------
                # BFS QUEUE
                # --------------------------------------------

                if destination not in self.visited:

                    self.visited.add(destination)

                    queue.append(
                        (
                            destination,
                            next_hop,
                            new_path,
                            new_cumulative
                        )
                    )

                    self.paths.append(
                        new_path
                    )

        return self.build_result(
            source_wallet
        )

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    def build_result(
        self,
        source_wallet: str
    ) -> Dict[str, Any]:

        nodes = []

        for node, data in self.graph.nodes(data=True):

            nodes.append({
                "id": node,
                **data
            })

        edges = []

        for source, target, data in (
            self.graph.edges(data=True)
        ):

            edges.append({
                "source": source,
                "target": target,
                **data
            })

        result = {
            "status": "success",

            "engine": {
                "name": "AEGIS-TRACE",
                "component": "Graph Traversal + Taint Engine",
                "version": "1.0"
            },

            "analysis": {
                "source_wallet": source_wallet,
                "chain": "TRON",
                "token": "USDT",
                "max_hops": self.max_hops,
                "min_taint_usdt": self.min_taint
            },

            "summary": {
                "transactions": len(
                    self.transactions
                ),
                "wallets": len(
                    self.graph.nodes
                ),
                "paths": len(
                    self.paths
                ),
                "vasp_matches": len(
                    self.vasp_matches
                ),
                "excluded": len(
                    self.exclusions
                )
            },

            "transactions": self.transactions,

            "paths": self.paths,

            "vasp_matches": self.vasp_matches,

            "exclusions": self.exclusions,

            "graph": {
                "nodes": nodes,
                "edges": edges
            },

            "generated_at": now_iso()
        }

        result["evidence_sha256"] = sha256_json(
            result
        )

        return result


# ============================================================
# SAVE JSON
# ============================================================

def save_result(
    result: Dict[str, Any],
    filename: str = OUTPUT_FILE
) -> None:

    with open(
        filename,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            indent=2,
            ensure_ascii=False
        )


# ============================================================
# DEMO MODE
# ============================================================

def demo_analysis() -> Dict[str, Any]:

    source = "TDEMO0000000000000000000000000000000"

    demo_transactions = [
        {
            "tx_hash": "DEMO_TX_001",
            "from": source,
            "to": "TDEMO0000000000000000000000000000001",
            "amount_usdt": 500,
            "token": "USDT",
            "chain": "TRON",
            "timestamp": now_iso(),
            "hop": 1
        },
        {
            "tx_hash": "DEMO_TX_002",
            "from": "TDEMO0000000000000000000000000000001",
            "to": "TDEMO0000000000000000000000000000002",
            "amount_usdt": 450,
            "token": "USDT",
            "chain": "TRON",
            "timestamp": now_iso(),
            "hop": 2
        },
        {
            "tx_hash": "DEMO_TX_003",
            "from": "TDEMO0000000000000000000000000000002",
            "to": "TDEMO0000000000000000000000000000003",
            "amount_usdt": 400,
            "token": "USDT",
            "chain": "TRON",
            "timestamp": now_iso(),
            "hop": 3
        },
        {
            "tx_hash": "DEMO_TX_004",
            "from": "TDEMO0000000000000000000000000000003",
            "to": "TDEMO0000000000000000000000000000004",
            "amount_usdt": 300,
            "token": "USDT",
            "chain": "TRON",
            "timestamp": now_iso(),
            "hop": 4
        }
    ]

    paths = [
        [
            source,
            "TDEMO0000000000000000000000000000001"
        ],
        [
            source,
            "TDEMO0000000000000000000000000000001",
            "TDEMO0000000000000000000000000000002"
        ],
        [
            source,
            "TDEMO0000000000000000000000000000001",
            "TDEMO0000000000000000000000000000002",
            "TDEMO0000000000000000000000000000003"
        ],
        [
            source,
            "TDEMO0000000000000000000000000000001",
            "TDEMO0000000000000000000000000000002",
            "TDEMO0000000000000000000000000000003",
            "TDEMO0000000000000000000000000000004"
        ]
    ]

    nodes = []

    for index, wallet in enumerate(
        {
            address
            for path in paths
            for address in path
        }
    ):

        nodes.append({
            "id": wallet,
            "type": "source" if wallet == source else "wallet",
            "hop": 0
        })

    edges = []

    for tx in demo_transactions:

        edges.append({
            "source": tx["from"],
            "target": tx["to"],
            "tx_hash": tx["tx_hash"],
            "amount_usdt": tx["amount_usdt"],
            "hop": tx["hop"]
        })

    result = {
        "status": "success",
        "mode": "demo",

        "engine": {
            "name": "AEGIS-TRACE",
            "component": "Graph Traversal + Taint Engine",
            "version": "1.0"
        },

        "analysis": {
            "source_wallet": source,
            "chain": "TRON",
            "token": "USDT",
            "max_hops": MAX_HOPS,
            "min_taint_usdt": MIN_TAINT_USDT
        },

        "summary": {
            "transactions": len(
                demo_transactions
            ),
            "wallets": len(nodes),
            "paths": len(paths),
            "vasp_matches": 0,
            "excluded": 0
        },

        "transactions": demo_transactions,

        "paths": paths,

        "vasp_matches": [],

        "exclusions": [],

        "graph": {
            "nodes": nodes,
            "edges": edges
        },

        "generated_at": now_iso()
    }

    result["evidence_sha256"] = sha256_json(
        result
    )

    return result


# ============================================================
# REAL TRON ANALYSIS
# ============================================================

def real_tron_analysis() -> None:

    print()
    print("=" * 60)
    print("AEGIS-TRACE | REAL TRON ANALYSIS")
    print("=" * 60)

    wallet = input(
        "Enter suspect TRON wallet address: "
    ).strip()

    if not validate_tron_address(wallet):

        print()
        print("[ERROR] Invalid TRON wallet address.")
        print(
            "Example format: "
            "T + 33 Base58 characters"
        )
        return

    if not TRON_API_KEY:

        print()
        print(
            "[WARNING] TRON_PRO_API_KEY is not set."
        )
        print(
            "The real API request may be rejected "
            "by TronGrid."
        )

    print()
    print("[REAL] Starting blockchain analysis...")
    print(f"[REAL] Source: {wallet}")
    print(f"[REAL] Max hops: {MAX_HOPS}")
    print(
        f"[REAL] Minimum taint: "
        f"{MIN_TAINT_USDT} USDT"
    )

    start = time.time()

    try:

        engine = TaintEngine(
            max_hops=MAX_HOPS,
            min_taint=MIN_TAINT_USDT
        )

        result = engine.trace(wallet)

        elapsed = time.time() - start

        result["analysis"]["execution_seconds"] = round(
            elapsed,
            3
        )

        save_result(result)

        print()
        print("=" * 60)
        print("REAL ANALYSIS COMPLETE")
        print("=" * 60)

        print(
            f"Transactions : "
            f"{result['summary']['transactions']}"
        )

        print(
            f"Wallets      : "
            f"{result['summary']['wallets']}"
        )

        print(
            f"Paths        : "
            f"{result['summary']['paths']}"
        )

        print(
            f"VASP matches : "
            f"{result['summary']['vasp_matches']}"
        )

        print(
            f"Excluded     : "
            f"{result['summary']['excluded']}"
        )

        print(
            f"Time         : "
            f"{elapsed:.2f}s"
        )

        print()
        print(
            f"JSON saved: {OUTPUT_FILE}"
        )

        print(
            "Evidence SHA-256:",
            result["evidence_sha256"]
        )

    except Exception as exc:

        print()
        print("=" * 60)
        print("REAL ANALYSIS FAILED")
        print("=" * 60)

        print(
            f"{type(exc).__name__}: {exc}"
        )

        print()
        print(
            "IMPORTANT: Real mode does NOT "
            "fall back to demo mode."
        )


# ============================================================
# MAIN MENU
# ============================================================

def main():

    while True:

        print()
        print("=" * 60)
        print("AEGIS-TRACE")
        print("Graph Traversal + Taint Engine")
        print("=" * 60)

        print("1. Demo Analysis")
        print("2. Real TRON Analysis")
        print("3. Exit")

        choice = input(
            "\nSelect option: "
        ).strip()

        if choice == "1":

            result = demo_analysis()

            save_result(result)

            print()
            print("[DEMO] Analysis complete")
            print(
                f"Transactions : "
                f"{result['summary']['transactions']}"
            )
            print(
                f"Wallets      : "
                f"{result['summary']['wallets']}"
            )
            print(
                f"Paths        : "
                f"{result['summary']['paths']}"
            )
            print(
                f"JSON saved   : "
                f"{OUTPUT_FILE}"
            )

        elif choice == "2":

            real_tron_analysis()

        elif choice == "3":

            print("Exiting AEGIS-TRACE.")
            break

        else:

            print(
                "[ERROR] Invalid option."
            )


if __name__ == "__main__":
    main()

