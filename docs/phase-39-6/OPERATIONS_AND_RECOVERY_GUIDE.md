# OPERATIONS & EMERGENCY RECOVERY RUNBOOK

**Document ID:** `KAAMSETU-DOC-39-6-12`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Incident Escalation & Response Protocols

In the event of an operational regression in production:

### Incident 1: Rate Limiter 503 Outage
- **Symptom:** API returns `503 Service Unavailable` with message `"Authentication rate limiter temporarily unavailable"`.
- **Diagnostic Step:** Check Vercel runtime logs for `Component: RateLimiter` and verify that `RATE_LIMIT_HMAC_SECRET` is set in Vercel environment variables and that Supabase connection pool is healthy.
- **Recovery Action:** Verify Supabase connection string and ensure `check_and_increment_rate_limit` RPC exists in the public schema.

### Incident 2: Stale Build on Local Port
- **Symptom:** UI displays old component markup or missing buttons despite local file edits.
- **Diagnostic Step:** Run `lsof -i :3001` to determine running Node process PID. Check process launch time via `ps -ef | grep node`.
- **Recovery Action:** Terminate stale process via `kill -9 <PID>`, recompile via `npm run build`, and restart via `npm run start -- -p 3001`.

### Incident 3: Gemini API 404 / 503
- **Symptom:** AI extraction fails during onboarding.
- **Diagnostic Step:** Inspect server response code.
- **Recovery Action:** Ensure `GEMINI_MODEL` is set to `gemini-3.8-flash` or `gemini-2.5-flash`. The system will automatically engage the multi-model candidate chain and fallback to deterministic extraction.

---

## 2. Invariant Protection Summary

1. **Constitutional Invariant:** Platform commission on artisan wages must remain `0.00` permanently.
2. **Geographic Invariant:** Commercial operations must remain strictly bounded to Guwahati Urban (`781001–781039`) and Shillong Urban (`793001–793022`).
