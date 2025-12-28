# Plan: Portality Resurrection & God Mode

## Phase 1: Data Visibility (The Monitor)
- [x] Task: Audit `Portality.tsx` and ensure it connects correctly to the current Supabase schema. [5641821]
- [x] Task: Implement the "Real-time Rates" view showing current vs history. [21c50ab]
- [x] Task: Implement the "System Logs" viewer to stream events from Supabase. [c143cf7]

## Phase 2: Action Tools (The Control)
- [x] Task: Implement the "Manual Rate Ingest" form. [c79b814]
- [x] Task: Refactor the License Activation form to support MachineID lookups. [21c50ab]
- [x] Task: Integrate the interactive Calendar for Global License scheduling (with past-date disabling). [5b92332]

## Phase 3: Infrastructure (The Nodes)
- [x] Task: Add a "Node Status" dashboard to check connectivity of Gemini and Supabase services. [b7f2161]
- [x] Task: Final mobile-responsive polish for the dashboard. [b7f2161]

## Phase 4: Final Verification
- [x] Task: Manual Verification: Activate a license via Portality and verify it works in Calculator. [b7f2161]
- [x] Task: Manual Verification: Set a manual BCV rate and ensure it reflects instantly. [b7f2161]
- [x] Task: Conductor - User Manual Verification 'Portality Dashboard' (Protocol in workflow.md). [b7f2161]
