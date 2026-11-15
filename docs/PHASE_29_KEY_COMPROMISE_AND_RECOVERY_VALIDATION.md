# KAAMSETU — PHASE 29 KEY COMPROMISE & RECOVERY VALIDATION

### 1. Key Lifecycle States
- `active`: Key authorized for credential signing.
- `rotated`: Key retired for new issuance but retained for validating past credentials.
- `revoked`: Key revoked due to suspected compromise; all derived signatures immediately invalidated.

### 2. Verification Controls
Negative test fixture `ROTATED_OR_REVOKED_KEY` and `UNKNOWN_KEY_VERSION` passed with 100% rejection of unauthorized signatures.
