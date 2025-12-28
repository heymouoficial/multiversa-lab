# Tech Stack: CalculaTú (Production 2026)

## Core
- **Framework:** React 19 + Vite 6.
- **Language:** TypeScript (Strict Mode).
- **State Management:** Zustand (App Store) + TanStack Query (Server State & Cache).

## AI & Audio
- **LLM Provider:** Google Gemini API (v1 / v1beta).
- **Models:** 
  - `gemini-2.5-flash` (Chat/Text).
  - `gemini-2.5-flash-native-audio-dialog` (Voice/Websocket).
- **Audio Processing:** AudioWorklet (PCM Processor) @ 16kHz/24kHz.

## Backend & Database
- **Provider:** Supabase.
- **Database:** PostgreSQL with `pgvector` for RAG.
- **Functions:** Edge Functions (Deno) for document ingestion and license logic.

## UI & Styling
- **Engine:** Tailwind CSS 4 (CSS-first configuration).
- **Icons:** Lucide React.
- **Animations:** CSS Keyframes + Framer Motion.
- **Aesthetic:** Liquid Glass / Glassmorphism.