# Spec: Portality OS Core Integration & Bidirectional Notion Sync

## Overview
Implement the foundational architecture for bidirectional synchronization between Portality OS and Notion, while optimizing RAG performance and enabling generative component rendering.

## Requirements
- **Notion SDK Integration:**
    - Initialize Notion SDK with environment variables.
    - Implement CRUD operations for Notion databases: Clients, Services, Tasks, Team, and Calendar.
    - Establish a background sync or webhook-triggered mechanism for bidirectional updates.
- **RAG Optimization:**
    - Resolve latency issues in the Aureon interface.
    - Optimize the connection to Supabase (pgvector) and Flowise.
- **Generative Component Rendering:**
    - Implement the logic for Aureon to inject interactive React 19 components into the chat stream.
    - Ensure 100% rendering accuracy for initial component set (Charts, Tables, Task Cards).
- **Session-Aware Dashboard:**
    - Hydrate the dashboard based on the logged-in user profile from Notion/Supabase.
