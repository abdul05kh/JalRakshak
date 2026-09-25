# 07 — Timing Instrumentation Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** High-Precision Monotonic Time Tracking  
**Status:** PASS  

---

## 1. Timing Measurement Architecture

- **Precision Mechanism:** `time.monotonic()` on backend; `performance.now()` in browser.
- **Tracked Timestamps per Task:**
  1. `task_start_iso`: UTC ISO string when task prompt is presented.
  2. `first_interaction_ms`: Milliseconds to initial click, scroll, or input.
  3. `answer_submission_iso`: UTC ISO string when participant confirms answer.
  4. `task_duration_seconds`: Monotonic duration ($\Delta t = t_{\text{submit}} - t_{\text{start}}$).
- **Setup & Interruption Exclusion:** Technical pauses and researcher clarifications are excluded from active cognitive response duration.
