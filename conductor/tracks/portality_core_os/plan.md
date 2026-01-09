# Plan: Portality Core OS (Elevat OS)

**Strategy:** Consolidate Portality as the central Operating System for Multiversa/Elevat. Focus on the "Mirror" architecture (Notion Sync), "Aureon" Superintelligence, and the "Liquid Glass" UX.

## Phase 1: Foundation & Intelligence (The Cortex)
*Goal: Ensure the OS is stable, intelligent, and visually immersive.*

- [ ] **Aureon Brain Upgrade:**
    - [ ] Audit `geminiService.ts` to ensure optimal model usage (Gemini 2.0 Flash / 1.5 Flash Latest).
    - [ ] Verify System Prompt aligns with "Cyberpunk/Visionary" persona.
    - [ ] Test "Hydra" failover in the context of Portality.
- [ ] **Liquid Glass UX:**
    - [ ] Audit `index.css` and `tailwind.config.js` for "Dark Opal" palette consistency.
    - [ ] Refine `AureonDock` and `FloatingChat` for maximum fluidity.
    - [ ] Ensure `App.tsx` routes map correctly to the Sidebar navigation.
- [ ] **Strict Types:**
    - [ ] Run `pnpm build` (tsc) and resolve all strict mode errors.

> **👮‍♂️ Verificación Conductor:**
> 1. Aureon responds with "Multiversa Identity" (Professional/Visionary).
> 2. Dashboard loads without visual glitches (Glassmorphism).
> 3. `pnpm build` passes with 0 errors.

## Phase 2: The Mirror (Notion Sync)
*Goal: "What happens in Portality, happens in Notion."*

- [ ] **Notion Schema:**
    - [ ] Verify `clients`, `projects`, `tasks` tables in Supabase match Notion structure.
    - [ ] Create `services/notionService.ts` if not exists (Direct SDK or Proxy).
- [ ] **Bi-directional Flow:**
    - [ ] Implement Webhook receiver (via Supabase Edge Function or n8n) for Notion updates.
    - [ ] Implement `syncToNotion` utility for Portality actions.
- [ ] **Views Integration:**
    - [ ] Connect `ClientsView` to real Supabase data (synced from Notion).
    - [ ] Connect `KanbanView` to `tasks` table.

> **👮‍♂️ Verificación Conductor:**
> 1. Create a task in Portality -> Appears in Notion (or mocked sync log).
> 2. Edit a client in Notion -> Updates in Portality `ClientsView`.

## Phase 3: The Brain (RAG Integration)
*Goal: Give Aureon access to the organization's knowledge.*

- [ ] **Knowledge Manager UI:**
    - [ ] Implement `RAGView.tsx` for uploading/managing documents.
    - [ ] Connect to `ingest-file` Edge Function (refer to `portality_brain_rag` track).
- [ ] **Context Injection:**
    - [ ] Ensure `geminiService.ts` retrieves relevant context based on `organization_id`.

> **👮‍♂️ Verificación Conductor:**
> 1. Upload a PDF/TXT in `RAGView`.
> 2. Ask Aureon a specific question from that document.

## Phase 4: Multi-tenant Operations
*Goal: Support multiple agencies/organizations safely.*

- [ ] **Onboarding Flow:**
    - [ ] Verify `MemberInviteModal` functionality.
    - [ ] Test Role-Based Access Control (Admin vs Member) in UI.
- [ ] **Organization Settings:**
    - [ ] Implement `SettingsPanel` for Org-specific configurations (Branding, Keys).

> **👮‍♂️ Verificación Conductor:**
> 1. Log in as Admin -> See full access.
> 2. Log in as Member -> Restricted access.
