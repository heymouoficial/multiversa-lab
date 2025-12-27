# Plan: UI Cleanup, Chat API Fix & SavaraPro Reactivation

## Phase 1: Investigation & Cleanup
- [x] Task: Locate and remove "purple feedback icon" (FeedbackForm or similar) across the codebase. [5449831]
- [x] Task: Inspect `api/chat.ts` and `services/geminiService.ts` for logic errors or missing env vars.
- [x] Task: Verify `.env.local` and Vercel environment variables for API key validity.
- [x] Task: Create a diagnostic script to test the `/api/chat` endpoint locally. [4f27a61]
- [x] Task: Conductor - User Manual Verification 'Investigation & Cleanup' (Protocol in workflow.md) [5b92332]

## Phase 2: API Restoration & SavaraPro Reactivation
- [x] Task: Fix identified issues in `api/chat.ts` to resolve 500 errors. [c6fd374]
- [x] Task: Modify `api/license/verify` (or equivalent) to bypass restrictions for SavaraPro until 2026-01-01. [c6fd374]
- [x] Task: Update `SavaraCallModal.tsx` or related components to allow "Free Access" logic. [c6fd374]
- [x] Task: Update the "January 2026" banner to reflect the temporary free access. [c6fd374]
- [x] Task: Write integration tests for the "Free Access" time-bomb logic. [c143cf7]
- [x] Task: Conductor - User Manual Verification 'API Restoration & SavaraPro Reactivation' (Protocol in workflow.md) [5b92332]

## Phase 3: Verification & Finalization
- [x] Task: Run full test suite (`npm test`) to ensure no regressions in Calculator or Savara. [5b92332]
- [x] Task: Perform manual mobile verification of the Chatbot on the landing page. [5b92332]
- [x] Task: Perform manual verification of SavaraPro call functionality. [5b92332]
- [x] Task: Conductor - User Manual Verification 'Verification & Finalization' (Protocol in workflow.md) [5b92332]
