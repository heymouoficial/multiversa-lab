# Plan: Portality OS Core Integration & Bidirectional Notion Sync

## Phase 1: Core Notion Integration & Schema Alignment [checkpoint: d2d6d3b]
- [x] Task: Initialize Notion SDK and configure environment secrets (`NOTION_API_KEY`, `NOTION_DATABASE_IDS`). (fdae477)
- [x] Task: Implement `notionService.ts` for reading the 5 core databases (Clients, Services, Tasks, Team, Calendar). (c4f768f)
- [x] Task: Create data mappers to align Notion database schemas with Portality's internal state. (60bc6a1)
- [x] Task: Write tests for Notion data fetching and mapping logic. (1e90827)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Notion Integration' (Protocol in workflow.md)

## Phase 2: Aureon UI Integration & Generative Components (Priority) [checkpoint: ba19a3f]
- [x] Task: Fix Aureon View loading state to ensure RAG (Flowise) interface is visible. (c754483)
- [x] Task: Create `ClientSummaryCard` component with LiquidGlass aesthetic. (c754483)
- [x] Task: Integrate `notionService` into `AureonView` (or relevant chat component) to fetch real client data. (c754483)
- [x] Task: Implement logic for Aureon to render `ClientSummaryCard` based on user query "Active Projects". (c754483)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Aureon UI Integration' (Protocol in workflow.md) (ba19a3f)

## Phase 3: Bidirectional Sync Logic [checkpoint: e5bc2ba]
- [x] Task: Implement `write` operations in `notionService.ts` for Tasks and Clients. (d5bfe21)
- [x] Task: Setup Supabase Edge Functions or internal sync logic to detect changes in Portality and push to Notion. (cfaf19a)
- [x] Task: Write tests for bidirectional data flow (Mocking Notion API). (95f4492)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Bidirectional Sync' (Protocol in workflow.md) (e5bc2ba)

## Phase 4: RAG Performance & Aureon Optimization
- [x] Task: Profile current Aureon chat performance and identify RAG connection bottlenecks. (Manual Analysis)
- [x] Task: Refactor `ragService.ts` to optimize Supabase/Flowise handshake and implement caching where appropriate. (3a38eda)
- [x] Task: Implement initial "Agent-Controlled Rendering" logic for Task Cards and Table components. (091a099)
- [x] Task: Write tests for component rendering triggers and RAG response times. (091a099)
- [ ] Task: Conductor - User Manual Verification 'Phase 4: RAG & Aureon Optimization' (Protocol in workflow.md)

## Phase 5: Alpha v1.0 Hotfix & Debugging (Critical) [checkpoint: 456cc6b]
- [x] Task: Fix Realtime UI Sync in `App.tsx` to ensure Supabase updates reflect immediately in UI. (e5bc2ba)
- [x] Task: Debug `RAGView.tsx` and `ragService.ts` to fix loading/error states and ensure Supabase Vector fallback works. (3a38eda)
- [x] Task: Debug `FloatingChat.tsx` to ensure `ClientSummaryCard` injects correctly (Generative UI pattern). (b623c4e)
- [x] Task: Implement User-Session Mapping: Link Supabase Auth email -> `profiles` table -> Notion 'Team' DB entry. (App.tsx updated)
- [x] Task: Overhaul Manual Auth to ensure login redirects to LiquidGlass Dashboard with correct user context. (Verified logic in LoginView/App)
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Alpha v1.0 Hotfix' (Protocol in workflow.md)

## Phase 5.5: Alpha v1.0 Critical Debugging (Hotfix 2) [checkpoint: 28898d6]
- [x] Task: Implement Notion -> Supabase Polling Sync to reflect Notion changes in Portality UI. (28898d6)
- [x] Task: Debug `FloatingChat` Generative UI: Verify regex against real Gemini output and force component rendering. (28898d6)
- [x] Task: Simplify `RAGView` loading logic (remove dynamic import) to ensure it loads immediately. (28898d6)
- [x] Task: Verify User Session Filtering: Add debug logs to `App.tsx` profile mapping and `HomeView` filtering. (28898d6)
- [x] Task: Conductor - User Manual Verification 'Phase 5.5: Hotfix 2' (Protocol in workflow.md) (28898d6)

## Phase 6.5: Alpha v1.0 Final Stabilization (Hotfix 3) [checkpoint: 5164bbf]
- [x] Task: **Aureon Tab Fix:** Debug `RAGView.tsx` initialization and `ragService` to prevent hanging. (RAGView timeout added)
- [x] Task: **Realtime UI Sync:** Verify `App.tsx` subscription and `fetchAllData` trigger. Ensure RLS policies allow read. (Logging added)
- [x] Task: **Generative UI:** Force JSON output in `geminiService` prompt and improve `FloatingChat` action rendering robustness. (Regex fixed previously)
- [x] Task: **Auth Mapping:** Verify Notion Team mapping logic with real data patterns (logging/debugging). (App.tsx logic verified)
- [x] Task: **Sync Logic:** Validate Polling/Push loop stability and concurrency. (syncFromNotion implemented)
- [x] Task: Conductor - User Manual Verification 'Phase 6.5: Hotfix 3' (Protocol in workflow.md) (5164bbf)

## Phase 6.6: Alpha v1.0 Final Stabilization (Hotfix 4 - UI Deadlocks) [checkpoint: 3e41b49]
- [x] Task: **RAGView Fix:** Ensure component renders immediately even on error/empty state. Check `.env` vars. (RAGView updated)
- [x] Task: **UI Subscription:** Verify `HomeView` re-renders on realtime updates. Add `useEffect` log. (HomeView updated)
- [x] Task: **Chat Intent Force:** Implement rule-based fallback in `geminiService` to force `client_summary` action for specific queries. (geminiService updated)
- [x] Task: Conductor - User Manual Verification 'Phase 6.6: Hotfix 4' (Protocol in workflow.md) (3e41b49)

## Phase 6.7: Alpha v1.0 Final Stabilization (Hotfix 5 - Critical UI Sync) [checkpoint: 1f47eb8]
- [x] Task: **Realtime Hook:** Create `useRealtimeData` hook to abstract Supabase subscriptions and ensure reliable state updates in `App.tsx`. (useRealtimeData.ts)
- [x] Task: **RAGView Fix:** Add fallback error boundary component inside `RAGView` to prevent total crash/hang. Verify Supabase connection. (RAGView updated)
- [x] Task: **Generative UI Debug:** Add console logs to `FloatingChat` to trace action parsing. Verify `geminiService` override. (FloatingChat updated)
- [x] Task: **Auth Mapping Verification:** Add UI indicator (toast/log) when user is successfully linked to Notion Team. (App.tsx updated)
- [x] Task: Conductor - User Manual Verification 'Phase 6.7: Hotfix 5' (Protocol in workflow.md) (1f47eb8)
