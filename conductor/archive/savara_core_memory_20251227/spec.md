# Specification: Savara Core Integration & Identity Memory

## Overview
Transform Savara (Voice & Chat) from a "stateless assistant" into a **context-aware identity partner**. Savara must recognize the user via their `machineId`, greet them by name, and possess the ability to query the Supabase database directly (read-only for user data, read/write for shopping lists/history) using "Tools" (Function Calling).

## Functional Requirements

### 1. Identity Injection (The "Elephant Memory")
*   **Context Load:** When `useSavaraLive` initializes, it must receive the current `machineId` and `userName` from the store.
*   **System Prompt Update:** The initial system instruction sent to Gemini must include:
    *   "Estás hablando con {userName}."
    *   "Su ID de dispositivo es {machineId}."
    *   "Tienes acceso a la base de datos de Multiversa."

### 2. Supabase Tooling (Function Calling)
Savara needs new "eyes" into the database. We will implement the following client-side tools in `useSavaraLive.ts`:
*   `get_user_profile()`: Fetches details from the `profiles` table using the current `machineId`.
*   `check_license_status()`: Queries the `licenses` or `contracts` table to see expiration dates and features.
*   `get_bcv_rate()`: Fetches the latest *official* rate from the database (source of truth).

### 3. Context Awareness
*   Savara should be able to answer: "¿Cuándo se vence mi licencia?" or "¿Cómo te llamas?" (knowing she is Savara assigned to *this* user).

## Technical Architecture
*   **Frontend-First Tooling:** Tools will be executed client-side using the existing `supabase` client (RLS protected).
*   **Dynamic Schema:** The JSON schema sent to Gemini via WebSocket must be updated to include these new function definitions.

## Non-Functional Requirements
*   **Privacy:** Savara must only access data related to the current `machineId` (enforced by RLS, but also by logic).
*   **Latency:** Tool execution must be optimized to keep the conversation fluid.
