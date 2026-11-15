# KAAMSETU — PHASE 30 ONDC ROOT KEY CEREMONY RUNBOOK

### Execution Runbook: `ONDC-CEREMONY-RUNBOOK-v1.0`
1. **Environment:** Air-gapped workstation running trusted Linux live OS.
2. **Custody Split:**
   - Custodian A (CISO): Master passphrase and primary seed half.
   - Custodian B (Core Infra Lead): Hardware security module and secondary seed half.
3. **Key Generation:** Ed25519 master root key pair generated deterministically.
4. **Registry Submission:** Public key multibase exported to encrypted media for ONDC upload.
