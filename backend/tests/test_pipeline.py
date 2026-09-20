from app.services.analysis_pipeline import run_analysis


def test_run_analysis_returns_expected_structure():
    wallet = "0x1111111111111111111111111111111111111111"
    transactions = [
        {"from": "0xAAA", "to": "0xBBB", "value": 100},
        {"from": "0xBBB", "to": "0xCCC", "value": 85},
        {"from": "0xCCC", "to": "0xDDD", "value": 70},
        {"from": "0xDDD", "to": "0xAAA", "value": 55},
    ]

    result = run_analysis(wallet, transactions)

    assert result["wallet_address"] == wallet.lower()
    assert result["transaction_summary"]["received_transactions"] == 4
    assert isinstance(result["exchange_matches"], list)
    assert set(result.keys()) >= {
        "wallet_address",
        "transaction_summary",
        "exchange_matches",
        "nearest_vasp",
        "wallet_cluster",
        "risk",
        "alert",
        "pattern_findings",
        "pattern_summary",
    }
    assert result["risk"]["risk_score"] >= 0
    assert result["alert"]["wallet_address"] == wallet.lower()
