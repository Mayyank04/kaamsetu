# KAAMSETU — PHASE 29 OFFLINE REVOCATION BOUNDARY TEST

### 1. Architectural Boundary
KAAMSETU distinguishes online W3C status list checks from offline 2G/air-gapped QR verification:
- Offline QR codes contain compressed base64url payloads with cryptographic signatures verifiable without connectivity.
- Air-gapped verifier devices enforce a **72-hour maximum cache freshness** SLA. Caches older than 72 hours are flagged stale.
