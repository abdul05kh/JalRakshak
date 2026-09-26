import hashlib
import json
import time
from typing import Dict, Any

class CryptographicDecisionAuditLogger:
    def __init__(self):
        self.chain = []
        self.prev_hash = "0" * 64

    def log_decision_event(self, officer_id: str, action: str, details: Dict[str, Any]) -> str:
        record = {
            "index": len(self.chain),
            "timestamp": time.time(),
            "officer_id": officer_id,
            "action": action,
            "details": details,
            "prev_hash": self.prev_hash
        }
        raw_bytes = json.dumps(record, sort_keys=True).encode('utf-8')
        record_hash = hashlib.sha256(raw_bytes).hexdigest()
        record["hash"] = record_hash
        self.chain.append(record)
        self.prev_hash = record_hash
        return record_hash
