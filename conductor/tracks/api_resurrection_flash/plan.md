# Plan: API Resurrection & Flash Optimization

**Strategy:** Immediate migration to Gemini 1.5 Flash followed by safety mechanisms to preserve quota.

## Phase 1: Configuration & Model Switch
*Goal: Restore functionality with the new model and key.*

- [ ] **Credential Update:** 
    - [ ] Update `.env.local` with the new `VITE_GEMINI_API_KEY`.
    - [ ] Verify the key is correctly loaded in the app.
- [x] **Model Migration:**
    - [x] Refactor `geminiService.ts` to use `gemini-1.5-flash-latest`.
    - [x] Refactor `useSavaraLive.ts` to ensure consistency in model selection.

> **👮‍♂️ Verificación Conductor:**
> 1. Start the app and verify Savara responds to a text prompt.
> 2. Inspect network tab to confirm requests are going to the Flash model.

## Phase 2: Quota Protection (The Time-Bomb)
*Goal: Prevent accidental drain of minutes/tokens.*

- [x] **Silence Timeout:**
    - [x] Implement a 60-second inactivity timer in `useSavaraLive.ts`.
    - [x] Reset timer on voice activity (VAD or audio packets).
    - [x] Trigger `disconnect()` when the timer expires.
- [x] **429 Handling:**
    - [x] Add a try/catch block in `geminiService.ts` specifically for status code 429.
    - [x] Integrate with the UI toast system to show the "Resting" message.

> **👮‍♂️ Verificación Conductor:**
> 1. Open Savara Voice and stay silent for >60s. Confirm session closes automatically.
> 2. Simulate or trigger a 429 error and verify the custom Toast appears.

## Phase 3: Validation & Cleanup
*Goal: Ensure stability and remove legacy Pro references.*

- [ ] **Regression Testing:** Verify text chat and voice chat both work seamlessly.
- [ ] **Cleanup:** Remove any hardcoded references to `gemini-1.5-pro`.

> **👮‍♂️ Verificación Conductor:**
> 1. Complete a full "Shopping Flow" (Price check + Voice query) without errors.
