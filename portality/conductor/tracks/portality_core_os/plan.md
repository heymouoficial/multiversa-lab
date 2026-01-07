# Plan: Portality Core OS (Elevat OS) - ALPHA LAUNCH

**DEADLINE:** 2026-01-07 03:30 AM
**OBJECTIVE:** MVP Validation Release for Team (Andrea/Christian).

**Strategy:** "Shock & Awe". Deliver a functional, beautiful, and intelligent OS.
Prioritize visual impact (Liquid Glass) and core connectivity (Notion/Voice).

## Phase 1: The Foundation (Schema & Data)
*Goal: Establish the Single Source of Truth.*

- [x] **Database Migration:**
    - [x] Create `20260107_elevat_os_full.sql` migration file.
    - [ ] **ACTION:** Run migration in Supabase SQL Editor.
- [x] **Supabase Types:**
    - [x] Regenerate TypeScript definitions (`types/supabase.ts`) based on new schema. (Updated types.ts)
    - [x] Update `types.ts` to reflect `Task`, `Client`, `Service` changes.

## Phase 2: The Interface (Liquid Glass UI)
*Goal: "Wow Factor" & Fluidity.*

- [x] **Dashboard Refactor:**
    - [x] Connect `HomeView` to real `tasks` table.
    - [x] Implement "Glass Containers" with subtle animated borders.
    - [x] Ensure background gradients are smooth and non-intrusive.
- [x] **Aureon Presence:**
    - [x] Update `FloatingChat` to use `useAureonLive`.
    - [x] Visualize "Voice State" (Orb animation) in the Dock.

## Phase 3: The Mirror (Notion Sync)
*Goal: Bidirectional Trust.*

- [x] **Webhooks:**
    - [x] Verify `notionService.ts` points to correct n8n webhook.
    - [x] Implement robust error handling (Toast notifications) if sync fails.

## Phase 4: Multi-tenant Operations & Access Control
*Goal: Secure team onboarding and organization management.*

- [x] **Member Invitation System:**
    - [x] Implement `MemberInviteModal.tsx` using Supabase `inviteUserByEmail` (via Edge Function) or generic Sign Up.
    - [x] Update `LoginView.tsx` to handle "Update Password" flow for invited users.
    - [x] **CRITICAL:** Ensure Andrea/Christian can set their own passwords upon first login.
- [ ] **Organization Settings:**
    - [ ] Implement `SettingsPanel` for Org-specific configurations (Branding, Keys).

> **👮‍♂️ Verificación Conductor:**
> 1. Log in as Admin -> See full access.
> 2. Invite `newuser@elevat.com`.
> 3. New user clicks link -> Sets Password -> Accesses Dashboard.

> **👮‍♂️ Verificación Conductor (3:30 AM Check):**
> 1. **Login:** Team can log in with Email/Pass.
> 2. **Voice:** Click Orb -> Speak -> Receive Response (Voice).
> 3. **Tasks:** Create Task via Voice -> Appears on Dashboard.
> 4. **Visuals:** No broken layouts on Mobile.