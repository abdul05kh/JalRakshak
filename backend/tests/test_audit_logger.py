from backend.app.telemetry.audit_logger import CryptographicDecisionAuditLogger

def test_hash_chain_integrity():
    logger = CryptographicDecisionAuditLogger()
    h1 = logger.log_decision_event("OFFICER-01", "APPROVE_ROUTE_R02", {"deadline": 2661})
    h2 = logger.log_decision_event("OFFICER-01", "DISPATCH_SIRENS", {"zone": "MALIDEWAL"})
    assert logger.chain[1]["prev_hash"] == h1
    assert logger.chain[1]["hash"] == h2
