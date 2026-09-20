from app.services.nearest_vasp import find_nearest_vasp


def test_find_nearest_vasp_reaches_known_exchange():
    root = "0x1111111111111111111111111111111111111111"
    middle = "0x2222222222222222222222222222222222222222"
    exchange = "0x3333333333333333333333333333333333333333"

    transactions = [
        {"from": root, "to": middle},
        {"from": middle, "to": exchange},
    ]

    result = find_nearest_vasp(root, transactions, max_hops=3)

    assert result["vasp_found"] is True
    assert result["nearest_vasp"]["exchange"] == "Coinbase"
    assert result["nearest_vasp"]["matched_address"] == exchange
    assert result["hop_distance"] == 2
