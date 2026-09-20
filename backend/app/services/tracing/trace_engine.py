import asyncio
from app.services.blockchain.etherscan import get_transactions


async def get_connected_wallets(wallet_address: str, offset: int = 1000):
    transactions = await get_transactions(wallet_address, offset=offset)

    connected_wallets = set()
    target = wallet_address.lower()

    for tx in transactions:
        sender = tx.get("from")
        receiver = tx.get("to")

        if not sender or not receiver:
            continue

        if sender.lower() == target and receiver.lower() != target:
            connected_wallets.add(receiver)

        elif receiver.lower() == target and sender.lower() != target:
            connected_wallets.add(sender)

    return list(connected_wallets)


async def trace_wallet(wallet_address: str, max_hops: int = 2, max_nodes: int = 1000):
    """
    Trace suspect wallet transactions and build an intelligence relationship graph
    capable of discovering and displaying up to 1,000 real blockchain wallet nodes.
    """
    visited = set()
    graph = {}
    all_transactions = []

    root_lower = wallet_address.lower()
    discovered_wallets = {root_lower}
    current_level = [wallet_address]

    sem = asyncio.Semaphore(5)

    async def fetch_wallet_transactions(w: str):
        async with sem:
            return await get_transactions(w, offset=1000, sort="desc")

    for hop in range(1, max_hops + 1):
        if len(discovered_wallets) >= max_nodes:
            break

        # Filter out already visited wallets for this hop
        wallets_to_fetch = [
            w for w in current_level
            if w.lower() not in visited
        ]

        if not wallets_to_fetch:
            break

        # In multi-hop levels, fetch transactions concurrently up to node limit
        if hop > 1 and len(wallets_to_fetch) > 30:
            wallets_to_fetch = wallets_to_fetch[:35]

        # Fetch transaction histories concurrently
        results = await asyncio.gather(
            *(fetch_wallet_transactions(w) for w in wallets_to_fetch),
            return_exceptions=True
        )

        next_level = []

        for wallet, tx_result in zip(wallets_to_fetch, results):
            wallet_lower = wallet.lower()
            visited.add(wallet_lower)

            if isinstance(tx_result, Exception) or not isinstance(tx_result, list):
                transactions = []
            else:
                transactions = tx_result

            all_transactions.extend(transactions)
            connected = set()

            for tx in transactions:
                sender = tx.get("from")
                receiver = tx.get("to")

                if not sender or not receiver:
                    continue

                s_lower = sender.lower()
                r_lower = receiver.lower()

                peer = None
                if s_lower == wallet_lower and r_lower != wallet_lower:
                    peer = receiver
                elif r_lower == wallet_lower and s_lower != wallet_lower:
                    peer = sender

                if peer:
                    peer_lower = peer.lower()
                    if peer_lower in discovered_wallets or len(discovered_wallets) < max_nodes:
                        connected.add(peer)
                        discovered_wallets.add(peer_lower)

            connected_list = list(connected)

            graph[wallet] = {
                "hop": hop,
                "connected_wallets": connected_list
            }

            for connected_wallet in connected_list:
                cw_lower = connected_wallet.lower()
                if cw_lower not in visited and cw_lower not in [x.lower() for x in next_level]:
                    next_level.append(connected_wallet)

            if len(discovered_wallets) >= max_nodes:
                break

        current_level = next_level
        if not current_level:
            break

    return {
        "root_wallet": wallet_address,
        "max_hops": max_hops,
        "max_nodes": max_nodes,
        "wallets_analyzed": len(visited),
        "total_nodes": len(discovered_wallets),
        "graph": graph,
        "transactions": all_transactions
    }
