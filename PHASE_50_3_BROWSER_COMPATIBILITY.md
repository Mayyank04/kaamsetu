# KAAMSETU — PHASE 50.3 BROWSER & HARDWARE COMPATIBILITY MATRIX

**Project:** KAAMSETU — India's Skill Identity and Workforce Platform  
**Phase:** 50.3 — Translator Experience & Voice Engine Rebuild  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`

---

## 1. Browser Platform Matrix

The KAAMSETU voice and translation engine was tested against modern browser engines used widely across urban and semi-urban India:

| Browser / Environment | Engine | Speech Recognition (STT) | Speech Synthesis (TTS) | Indic Voice Availability | Fallback Handling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Chrome (Desktop / Android)** | Blink / V8 | Full Native (`webkitSpeechRecognition`) | Full Native (`speechSynthesis`) | Excellent (Google Hindi, Google Bengali, etc.) | Asynchronous voice catalog populated via `onvoiceschanged`. |
| **Apple Safari (macOS / iOS 15+)** | WebKit | Full Native (`SpeechRecognition`) | Full Native (`speechSynthesis`) | High (Siri Indian English, Lekha, Rishi, Swara) | Requires explicit user tap gesture for first audio utterance. |
| **Microsoft Edge (Windows / Android)** | Chromium | Full Native (`webkitSpeechRecognition`) | Full Native (`speechSynthesis`) | Superior (Microsoft Swara Online Neural, Madhur) | Neural voices scored highest in quality ranking (+35). |
| **Mozilla Firefox (Desktop / Android)** | Gecko | Text Fallback Prompted | Full Native (`speechSynthesis`) | Good (System OS synthesizers) | Transparent microphone alert guiding to text or Chrome/Safari. |
| **Android WebView / PWA Wrapper** | Chromium WebView | Native (Requires App RECORD_AUDIO perm) | Full Native (`speechSynthesis`) | System-dependent | Safe fallback to typing with clear error guidance. |

---

## 2. Audio Playback Policy & Mobile Lifecycle Constraints

### User Interaction Gate
Mobile WebKit (iOS Safari) and Chromium (Android Chrome) enforce strict autoplay restrictions:
1. Audio synthesis cannot trigger automatically without a preceding user touch or click event.
2. KAAMSETU enforces user-initiated triggers: audio playback only begins when the user taps `Play` on the `AudioChannelBar`.
3. Speech queue cancellation (`window.speechSynthesis.cancel()`) is invoked before each new utterance to clear stale audio buffers on mobile OS transitions.

### Asynchronous Voice Loading (`voiceschanged`)
In Chromium browsers, `window.speechSynthesis.getVoices()` initially returns an empty array `[]` until the browser finishes loading its internal voice table.
Phase 50.3 handles this in `PlaybackController`:
```ts
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    this.refreshVoiceCatalogs();
  };
  this.refreshVoiceCatalogs();
}
```
If playback is requested before voices finish loading, `getVoicesForLanguage` provides a canonical synthetic voice object so speech synthesis still executes with the appropriate BCP-47 locale tag (`hi-IN`, `as-IN`, `bn-IN`, etc.).

---

## 3. Multi-Viewport Layout Responsiveness Matrix

Headless Chrome visual inspection was executed and saved to `screenshots/`:

| Viewport Target | Dimensions | Orientation | Layout Adaptation | Screenshot Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop High-DPI** | 1440 × 900 px | Landscape | Side-by-side dual pane layout (Input on left, Output on right). Dedicated audio bars in each section. Full speed pills and voice selector. | `screenshots/translate-desktop-1440.png` |
| **Tablet Portrait** | 768 × 1024 px | Portrait | Fluid 2-column grid collapsing gracefully without horizontal scroll. Quick chips scroll horizontally. | `screenshots/translate-tablet-768.png` |
| **Standard Mobile** | 390 × 844 px | Portrait | Stacked single-column card structure. Input panel on top, structured output below. Touch targets $\ge 44\times 44$ px. | `screenshots/translate-mobile-390.png` |
| **Narrow Mobile** | 320 × 568 px | Portrait | Ultra-compact mode for low-cost entry-level smartphones. Font sizes calibrate to 13–14px. Speed pills wrap cleanly. Zero horizontal overflow. | `screenshots/translate-mobile-320.png` |

---

## 4. Accessibility Compliance (WCAG 2.1 AA)

1. **Touch Targets:** All audio action buttons (`Play`, `Pause`, `Stop`, `Replay`, `Speed`) meet or exceed minimum $44 \times 44$ px accessible touch dimensions.
2. **Keyboard Navigation:** Full `focus-visible` ring indicators with `Tab` and `Enter`/`Space` activation.
3. **Screen Readers:** ARIA attributes configured:
   - `aria-label="Listen to Original Audio"`
   - `aria-label="Pause Original Audio"`
   - `aria-pressed={isSelected}` on speed control pills
   - `aria-expanded={isVoicePickerOpen}` on voice selectors
4. **Color Contrast:** Deep Forest Green (`#153E35`) text on Warm Ivory (`#F7F5F0`) canvas exceeds a 7:1 contrast ratio, surpassing the WCAG AAA requirement.
