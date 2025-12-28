# Spec: API Resurrection & Flash Optimization

## Context
The project is experiencing 429 (Resource Exhausted) errors using Gemini 1.5 Pro on the Free Tier. We are migrating to Gemini 1.5 Flash to take advantage of higher RPM (15 vs 2) and implementing optimizations to prevent future blocking.

## Requirements
1. **Model Switch:** Change all Gemini API calls to use `gemini-1.5-flash-latest`.
2. **Credential Update:** Use a new API Key (instructions for `.env.local`).
3. **Silence Timeout (Time-Bomb):** Automatically disconnect the voice session after 60 seconds of silence.
4. **Resilient Error Handling:** Catch 429 errors and display a user-friendly Toast ("Savara está descansando. Intenta en 1 min").

## Technical Details
- **Files to Modify:**
    - `CalculaTu/services/geminiService.ts`: Update model ID and error handling.
    - `CalculaTu/hooks/useSavaraLive.ts`: Implement the 60s silence timeout logic.
- **Model ID:** `gemini-1.5-flash-latest`
- **Quota Limit (Flash Free):** 15 RPM, 1 million TPM, 1,500 RPD.

## Success Criteria
- Savara responds correctly using the Flash model.
- Sessions terminate automatically after 1 minute of silence.
- 429 errors trigger the specific "resting" Toast.
