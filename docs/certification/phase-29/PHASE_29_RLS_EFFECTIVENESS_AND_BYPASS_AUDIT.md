# KAAMSETU — PHASE 29 RLS EFFECTIVENESS & BYPASS AUDIT

### 1. 100% RLS Coverage
- Exactly 100 of 100 public base tables have `rowsecurity = true`.
- Anonymous role (`anon`) cannot query unpublished worker profiles.
- Authenticated users cannot access cross-worker private records.
