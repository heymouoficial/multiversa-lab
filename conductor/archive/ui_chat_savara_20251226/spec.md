# Specification: UI Cleanup, Chat API Fix & SavaraPro Reactivation

## Overview
This track addresses three critical tasks: cleaning up legacy UI elements, fixing the broken Chat API on the landing page, and reactivating the SavaraPro voice capabilities with a temporary "Free Trial" window until January 1st.

## Functional Requirements
1.  **UI Cleanup (Feedback Icon):**
    *   Locate and completely remove the "purple feedback icon" component from the Calculator UI.

2.  **API Investigation & Fix (Chat 500 Error):**
    *   **Analyze:** Inspect `api/chat.ts` and `services/geminiService.ts`.
    *   **Verify:** Check API key configuration and environment variables.
    *   **Fix:** Resolve the 500 Internal Server Error to restore Chatbot functionality on the landing page.

3.  **SavaraPro Reactivation (Free Access):**
    *   **Enable:** Reactivate the bidirectional call API (SavaraPro) which is currently restricted.
    *   **Access Control:** Implement logic to allow **free, unrestricted access** to this feature until **January 1, 2026**.
    *   **UI Update:** Update or bypass the "Launch in January 2026" banner to permit entry to the feature immediately.

## Non-Functional Requirements
*   **Security:** Ensure API keys are handled securely during the fix.
*   **Time-Bomb:** The free access logic should automatically expire or revert after Jan 1, 2026 (or be easily togglable).

## Out of Scope
*   Permanent licensing system (this is a temporary reactivation).
