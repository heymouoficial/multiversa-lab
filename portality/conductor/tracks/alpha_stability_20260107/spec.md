# Spec: Alpha Stability & Team Access (Phase 2)

## Overview
Stabilize the Alpha v1.0 release by ensuring reliable realtime synchronization, fixing critical UI deadlocks in the intelligence interface, and implementing precise user-session mapping for Christian and Andrea. The goal is to move from a static interface to a living "Operating System" where data flows automatically and securely.

## Functional Requirements

### 1. Realtime UI Architecture
- **Multi-Table Subscription:** Implement a unified Supabase Realtime listener across `Tasks`, `Clients`, `Services`, and `Team` tables.
- **Hook-Based Sync:** Refactor `useRealtimeData` (or similar) to ensure `DataTable` and `TaskCard` components re-render immediately upon database updates without manual refresh.
- **Bidirectional Persistence:** Ensure the Notion SDK synchronization loop remains active and handles both local (Supabase) and external (Notion) updates with conflict resolution.

### 2. Aureon Intelligence Hotfix (RAG)
- **Deadlock Resolution:** Fix `RAGView.tsx` to prevent infinite loading. Implement a 5-second timeout for retrieval calls.
- **Graceful Fallbacks:** If the vector store is empty or the connection fails, display a "No documents found" or "Connection Error" message with a clear Retry button.
- **Direct pgvector Querying:** Ensure the RAG logic queries Supabase directly using `match_documents` RPC, bypassing external Flowise endpoints for this phase.

### 3. User-Session & Data Sovereignty
- **Identity Mapping:** Implement strict email-to-person mapping. Upon login, the system must link the Supabase Auth Email to the corresponding entry in the Notion 'Team' database.
- **Automatic Filtering:** Apply global filters across the Dashboard and Notion views based on the active user session. Christian and Andrea should only see tasks and clients relevant to their operational context.
- **Manual Credential Support:** Ensure the login flow correctly handles the manually created user accounts and redirects to the LiquidGlass Dashboard.

### 4. Generative Multimodal UI
- **Intent Parsing:** Upgrade `geminiService` to identify when a user is asking for a summary or a specific status.
- **Dynamic Injection:** Force the injection of React 19 components into the chat stream:
    - `ClientSummaryCard`: For project/client overviews.
    - `TaskActionCard`: For quick task completion/updates.
    - `TeamAvailabilitySnippet`: For workload checks.
    - `ServiceDetailCard`: For deep-dives into specific agency services.

## Acceptance Criteria
- [ ] Changing a status in Notion reflects in Portality within 30 seconds (polling) or instantly (if via SDK).
- [ ] `RAGView` loads in under 2 seconds or shows an actionable error message.
- [ ] Logged-in users see only their assigned tasks in the "My Focus" section.
- [ ] Aureon chat renders a `ClientSummaryCard` when asked "Dame un resumen de [Cliente]".
- [ ] No external third-party AI tools (Flowise/n8n) are required for core RAG or Sync logic.
