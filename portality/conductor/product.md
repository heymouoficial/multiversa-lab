# Product Guide: Portality (Elevat OS)

## Initial Concept
**Portality** is the central Operating System for **Elevat Marketing** and the **Multiversa Lab** ecosystem. It unifies operations, intelligence (Aureon AI), and data into a single verified interface.

**LiquidGlass UI Architecture:** The interface is not static; it utilizes a generative chat system that renders interactive components instead of plain text, allowing for fluid navigation between global summaries and detailed views.

## Target Users
- **Agency Administrators:** Managing operations and high-level strategy.
- **Marketing Operatives:** Executing daily tasks and campaigns. (Active: Christian, Andrea)
- **Aureon AI (Agentic):** The AI system itself acts as a user/operator within the OS.

## Core Goals
- **Bidirectional Agentic Integration (Alpha v1.0):** Implement the foundational architecture for active synchronization.
    - Configure Notion SDK for CRUD operations linked to 'Clients, Services, and Tasks'.
    - Unified Realtime UI: Components react instantly to database changes.
    - Data Sovereignty: All RAG and Sync logic runs locally via Supabase and Notion SDK.
- **Data Verification:** Ensure data logic is verified and ready for total automation.

## Key Features
- **Infrastructure & Automation Orchestrator:** A control module to monitor container health on Hostinger/Dokploy and manage custom image deployments.
- **Session-Aware Dynamic Dashboard:** A unique template that hydrates based on the logged-in user. Christian and Andrea see their personal task summaries filtered by email mapping.
- **Invitation-Led Onboarding:** Identification and registration system managed directly from the UI.
- **Generative Multimodal UI:** Aureon has total control over the dashboard. It utilizes Generative UI patterns to inject interactive components (Client Summary Cards, Task Action Cards, Team Availability Snippets, Service Detail Cards) directly into the chat stream.
- **Unified Data & RAG Hub:** A centralized "Data" section housing knowledge bases and dynamic views of the 5 Notion databases, powered by local pgvector search.
- **Omnipresent Aureon:** Floating chatbot (Landing + Dashboard) with command execution and screen navigation capabilities.

## Success Metrics
- **Centralized Operations & Bidirectional Sync:** Portality is a functional mirror of the 5 Notion databases, where changes are reflected in real-time.
- **RAG Precision & Prioritization:** Ensure Aureon uses local vector context to prioritize responses.
- **Frictionless Onboarding:** Successful invitation and registration flow completed from the interface.
- **UI Responsiveness:** 100% success rate in generating interactive components and handling realtime updates without refresh.
