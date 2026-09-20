import json
from pathlib import Path


def _resolve_data_file():
    candidates = [
        Path(__file__).resolve().parents[2] / "data" / "exchanges" / "ethereum_exchanges.json",
        Path(__file__).resolve().parents[3] / "data" / "exchanges" / "ethereum_exchanges.json",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return candidates[0]


DATA_FILE = _resolve_data_file()


def load_exchange_data():
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r") as file:
        return json.load(file)


def find_exchange(wallet_address: str):

    wallet = wallet_address.lower()

    exchanges = load_exchange_data()

    matches = []

    for exchange in exchanges:

        for address in exchange.get("addresses", []):

            if address.lower() == wallet:

                matches.append({
                    "exchange": exchange["name"],
                    "type": exchange["type"],
                    "chain": exchange["chain"],
                    "matched_address": address
                })

    return matches
