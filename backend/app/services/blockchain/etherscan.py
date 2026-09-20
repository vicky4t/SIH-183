import asyncio
import httpx

from app.config import ETHERSCAN_API_KEY


BASE_URL = "https://api.etherscan.io/v2/api"


async def get_transactions(
    wallet_address: str,
    offset: int = 1000,
    page: int = 1,
    sort: str = "desc"
):
    params = {
        "chainid": "1",
        "module": "account",
        "action": "txlist",
        "address": wallet_address,
        "startblock": 0,
        "endblock": 99999999,
        "page": page,
        "offset": offset,
        "sort": sort,
        "apikey": ETHERSCAN_API_KEY,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        for attempt in range(3):
            try:
                response = await client.get(BASE_URL, params=params)
                response.raise_for_status()

                data = response.json()

                # Handle Etherscan API rate limiting gracefully with backoff
                if data.get("status") == "0" and "rate limit" in str(data.get("result", "")).lower():
                    await asyncio.sleep(0.35 * (attempt + 1))
                    continue

                if data.get("status") == "0":
                    return []

                return data.get("result", [])

            except (httpx.RequestError, httpx.HTTPStatusError):
                if attempt == 2:
                    return []
                await asyncio.sleep(0.3 * (attempt + 1))

    return []
