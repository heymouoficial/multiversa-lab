# Specification: Portality Resurrection & God Mode

## Overview
Reactivate and enhance the **Portality Admin Panel** to serve as the central nervous system for Multiversa Lab. It must provide real-time visibility into the Supabase database, allow for granular license management, and manage exchange rate ingestion.

## Functional Requirements

### 1. Real-time Dashboard (Supabase Monitor)
*   **BCV Rates:** Display current USD/EUR rates and historical trends.
*   **Active Nodes:** Show status of connected services (Savara Live, API endpoints).
*   **Live Logs:** A stream of recent system events (License activations, errors, etc.).

### 2. Advanced License Management
*   **MachineID Link:** Ability to search for a user by their Fingerprint (MachineID).
*   **Activation Tool:** Create new licenses (Monthly/Lifetime) for specific devices.
*   **Global License Calendar:** An interactive calendar (`react-day-picker`) to activate global licenses.
    *   **Constraint:** Past days MUST be disabled and non-selectable.

### 3. Rate Ingestion
*   **Manual Override:** Inputs to manually set the official BCV rates if automation fails.
*   **Ingestion Status:** Show the timestamp of the last automatic sync.

## Technical Architecture
*   **Components:** Leverage existing components in `CalculaTu/components/Portality.tsx`.
*   **State:** Use `useAppStore` for local admin state and direct Supabase calls for data fetching.
*   **UI:** Tailwind CSS + Lucide Icons for a "Dark Mode Cyberpunk" aesthetic matching CalculaTú.

## Security
*   **PIN Protection:** Ensure the existing `VITE_PORTALITY_PIN` logic is robust.
*   **RLS:** Database operations must comply with Admin roles.
