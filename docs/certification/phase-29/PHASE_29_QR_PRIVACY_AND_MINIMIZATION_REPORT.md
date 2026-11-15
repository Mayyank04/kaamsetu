# KAAMSETU — PHASE 29 QR PRIVACY & DATA MINIMIZATION REPORT

### 1. Selective Disclosure
Offline QR payloads exclude bank account details and raw 12-digit Aadhaar numbers.
- Unmasked Aadhaar Regex Filter rejects any payload containing raw 12-digit Aadhaar numbers.
- Public profile view strictly masks phone and email for unauthenticated visitors.
