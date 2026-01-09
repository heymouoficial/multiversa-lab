# Tech Stack: Portality (Elevat OS)

## Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4 (LiquidGlass Aesthetic)
- **Icons:** Lucide React, React Icons
- **Content:** react-markdown, remark-gfm

## Backend & Persistence
- **Platform:** Supabase
- **Features:**
    - Authentication
    - PostgreSQL Database
    - Realtime Subscriptions (Multi-table)
    - pgvector for RAG Persistence (Local Search)

## AI & Intelligence
- **Core SDK:** Google Generative AI SDK (`@google/genai`)
- **Agent:** Aureon AI (Custom Agentic Logic)
- **RAG System:** Local pgvector search via `match_documents` RPC. (External Flowise/n8n bypassed for Alpha)

## Integrations & Orchestration
- **Data Source:** Notion SDK (@notionhq/client) with Realtime Bidirectional Sync via Supabase
- **Sync Method:** Push (Realtime) + Pull (30s Polling)
- **Orchestration:** MCP Hub

## Infrastructure
- **Hosting:** Hostinger (Container Orchestration)
- **Management:** Dokploy
- **Environments:** Google Workstation
- **Frontend Deployment:** Vercel
