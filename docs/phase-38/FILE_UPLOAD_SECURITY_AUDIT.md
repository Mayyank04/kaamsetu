# KAAMSETU — PHASE 38 FILE UPLOAD & ATTACHMENT SECURITY AUDIT

**Target:** File Upload Pipelines, Portfolio Media Ingestion, Supabase Storage Buckets  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Parent Baseline:** Phase 37 Modular Monolith  
**Audit Objective:** Analyze file upload handlers for arbitrary file upload vulnerabilities, inspect magic byte verification, assess file size restrictions, evaluate path traversal defenses, examine storage bucket isolation, and verify defenses against malicious polyglot files.

---

## 1. Executive Summary

KAAMSETU enables artisans and informal workers to upload proof of work, trade certifications, and portfolio photographs. Because file ingestion is historically a high-risk attack surface, KAAMSETU implements a defense-in-depth architecture across six security tiers:

1. **Authentication & Identity Binding:** Uploads require authenticated worker credentials (`requireWorker()`).
2. **Whitelisted MIME Encodings:** Strictly limited to `image/jpeg`, `image/png`, and `image/webp`.
3. **Magic Byte Inspection:** Inspects raw file buffers to verify true binary headers before processing.
4. **Size Caps:** Strict 5MB payload limit enforced before buffering.
5. **Path Traversal & Filename Sanitization:** Filenames are stripped of special characters, truncated, and prefixed with timestamps.
6. **Multi-Tenant Storage Isolation:** Files are written to user-specific directory trees (`${user.id}/${profileId}/${fileName}`) guarded by PostgreSQL Storage RLS policies.

---

## 2. In-Depth Handler Analysis (`src/app/api/worker/portfolio/upload/route.ts`)

### 2.1 Magic Byte Binary Header Verification
Client-supplied `Content-Type` headers can be trivial to spoof. KAAMSETU inspects the initial bytes of the uploaded buffer using `isValidImageContent()`:
- **JPEG:** Requires first 3 bytes to match `0xFF 0xD8 0xFF`.
- **PNG:** Requires first 4 bytes to match `0x89 0x50 0x4E 0x47` (PNG magic sequence).
- **WEBP:** Requires bytes 0-3 to equal `RIFF` and bytes 8-11 to equal `WEBP`.

If declared MIME type conflicts with the detected magic numbers (e.g. an executable `.php` or `.html` file renamed to `.png`), the upload is immediately rejected with HTTP 400: `File header does not match declared image type. Upload rejected.`

### 2.2 Storage Folder Isolation & Profile Ownership
- The endpoint performs an ownership lookup against `worker_profiles`:
  ```typescript
  if (!profileCheck || profileCheck.user_id !== user.id) {
    throw new AuthError("Forbidden: Cannot upload portfolio assets to another worker's identity.", 403);
  }
  ```
- Storage paths are strictly prefixed with `user.id`. Supabase Storage policies ensure that a worker cannot write or overwrite assets belonging to another worker (`auth.uid() = folder`).

### 2.3 Path Traversal Neutralization
Original client filenames are sanitized to prevent directory traversal (`../` or `..\\`):
```typescript
const cleanBasename = file.name
  .replace(/[^a-zA-Z0-9_-]/g, "_")
  .slice(0, 32);
const uniqueFileName = `${Date.now()}-${cleanBasename}.${safeExt}`;
```
The sanitized filename is guaranteed to contain only alphanumeric characters, underscores, and safe extensions (`.jpg`, `.png`, `.webp`).

---

## 3. Storage Bucket Policy & Static Serving Defense

### 3.1 Content-Disposition & MIME Type Enforcing
Uploaded objects are served with explicitly declared `Content-Type` headers (`image/jpeg`, `image/png`, `image/webp`). Browsers will not execute images as HTML/JavaScript because:
1. `X-Content-Type-Options: nosniff` header is enforced across all routes in `next.config.ts`.
2. Supabase Storage serves portfolio assets from isolated CDN origins.
3. SVG uploads are prohibited in portfolio uploads, preventing embedded XML/SVG XSS.

---

## 4. Residual Risk & Recommendations
- **Antivirus Scanning:** For enterprise and institutional scales beyond Class B rollout, integrate ClamAV or VirusTotal streaming inspection via background worker.
- **Current Assessment:** PASS. No unauthenticated, un-sanitized, or path-traversable file ingestion vectors exist.
