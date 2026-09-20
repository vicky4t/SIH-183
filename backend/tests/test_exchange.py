from app.services.exchange_matcher import find_exchange


def test_find_exchange_matches_known_wallet():
    wallet = "0x1111111111111111111111111111111111111111"

    matches = find_exchange(wallet)

    assert isinstance(matches, list)
    assert any(
        match["exchange"] == "Binance"
        and match["matched_address"] == wallet
        for match in matches
    )
