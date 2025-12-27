# Plan: Savara Core Integration & Identity Memory

## Phase 1: Identity Injection
- [x] Task: Update `useSavaraLive.ts` hook signature to accept `userName` and `machineId` props. [c79b814]
- [x] Task: Modify `CalculatorView.tsx` to pass the `userName` and `machineId` from `useAppStore` to `useSavaraLive`. [c79b814]
- [x] Task: Update the WebSocket handshake (`setup` message) in `useSavaraLive.ts` to include the user's identity in the `systemInstruction`. [c79b814]

## Phase 2: Supabase Tooling (The "Eyes")
- [x] Task: Define the JSON schema for `get_user_profile`, `check_license_status`, and `get_bcv_rate` in `useSavaraLive.ts`. [c79b814]
- [x] Task: Implement the JavaScript execution logic for these new tools inside the `handleToolCall` function, calling `supabase` client. [c79b814]
- [x] Task: Create a dedicated test suite `hooks/useSavaraTools.test.ts` to verify these tools return correct data structure. [c79b814]

## Phase 3: Integration & Verification
- [x] Task: Manual Verification: Ask Savara "Who am I?" and "When does my license expire?". [c79b814]
- [x] Task: Manual Verification: Ask Savara "What is the BCV rate today?" and ensure it reads from DB/Store, not hallucination. [c79b814]
- [x] Task: Conductor - User Manual Verification 'Savara Core Integration' (Protocol in workflow.md). [c79b814]
