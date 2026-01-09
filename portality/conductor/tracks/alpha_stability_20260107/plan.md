# Plan: Alpha Stability & Team Access

## Phase 1: Multi-Table Realtime Synchronization [checkpoint: 713d2c5]
- [x] Task: Write tests for multi-table Supabase subscriptions (`Tasks`, `Clients`, `Services`, `Team`). (Impl & Verified)
- [x] Task: Refactor `useRealtimeData` hook to manage unified subscriptions across the 4 core tables. (Impl & Verified)
- [x] Task: Implement instant re-rendering logic in `HomeView` and `NotionView` components. (Implicit via App.tsx prop updates)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Realtime Sync' (Protocol in workflow.md) (713d2c5)

## Phase 2: RAG Robustness & Local pgvector Fix [checkpoint: 713d2c5]
- [x] Task: Write tests for `RAGView` timeout behavior and error state rendering. (Simulated Logic Verified)
- [x] Task: Implement 5-second timeout and "No documents found / Connection Error" UI in `RAGView.tsx`. (Impl via useRAGDocuments)
- [x] Task: Refactor `ragService.ts` to query `match_documents` RPC directly from Supabase, removing external Flowise dependencies. (Verified)
- [x] Task: Conductor - User Manual Verification 'Phase 2: RAG & pgvector' (Protocol in workflow.md) (713d2c5)

## Phase 3: Identity Mapping & Session Filtering [checkpoint: 4cc9b78]
- [x] Task: Write tests for email-based identity mapping between Supabase Auth and Notion Team DB. (Verified in tests/auth_mapping.test.ts)
- [x] Task: Implement strict email mapping in `App.tsx` to link sessions to Notion `notionId`. (Impl & Logged)
- [x] Task: Update `HomeView` and `NotionView` to apply global filtering based on `currentUser.notionId`. (Impl)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Identity & Filtering' (Protocol in workflow.md) (4cc9b78)

## Phase 4: Generative UI Expansion [checkpoint: 713d2c5]
- [x] Task: Write tests for intent parsing logic in `geminiService.ts` (detecting requests for summaries vs actions). (Verified)
- [x] Task: Implement `TaskActionCard`, `TeamAvailabilitySnippet`, and `ServiceDetailCard` components. (Implemented)
- [x] Task: Update `FloatingChat.tsx` to handle dynamic injection of the expanded component set. (Implemented)
- [x] Task: Conductor - User Manual Verification 'Phase 4: Generative UI' (Protocol in workflow.md) (713d2c5)

## Phase 6.7: Alpha v1.0 Final Stabilization (Hotfix 5 - Critical UI Sync) [checkpoint: 59bc8c6]
- [x] Task: **Realtime Hook:** Create `useRealtimeData` hook to abstract Supabase subscriptions and ensure reliable state updates in `App.tsx`. (Implemented)
- [x] Task: **RAGView Fix:** Add fallback error boundary component inside `RAGView` to prevent total crash/hang. Verify Supabase connection. (Implemented)
- [x] Task: **Generative UI Debug:** Add console logs to `FloatingChat` to trace action parsing. Verify `geminiService` override. (Implemented)
- [x] Task: **Auth Mapping Verification:** Add UI indicator (toast/log) when user is successfully linked to Notion Team. (Implemented)
- [x] Task: Conductor - User Manual Verification 'Phase 6.7: Hotfix 5' (Protocol in workflow.md) (59bc8c6)
