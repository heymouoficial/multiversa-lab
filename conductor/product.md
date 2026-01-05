# Product Context: CalculaTú (Late 2025 Edition)

**Current Version:** Beta 1.0 (Stable - Production Ready)
**Last Updated:** Dec 29, 2025

## 🎯 Core Value Proposition

A "Mobile-First Agresiva" financial survival tool for Venezuelan consumers.

- **Offline-First:** Critical functionality works without internet (Mode Bunker).
- **Voice-First:** "Savara AI" acts as a shopping co-pilot via audio.
- **Zero Friction:** One-handed usage, instant currency conversion.

## 💰 Monetization & Pricing Strategy (The "CalculaTú" Model)

**1. Base Plans (Subscription / License)**

- **Monthly Plan (Pro Mensual):** $1 / month (Promo) | $3 (Regular). Includes 30 min of Voice/month.
- **Lifetime Plan (Pro Lifetime):** $10 One-time (Promo) | $20 (Regular). Includes 60 min of Voice/month.

**2. Pay-As-You-Go (Recargas / Top-ups)**

- **Logic:** Hard caps on minutes. Overages require a $1 top-up for additional credits.

## 🧠 AI Intelligence (Savara)

- **Text Engine:** `gemini-2.5-flash` (Standalone API, memoria persistente, identidad refinada).
- **Voice Engine:** `gemini-2.5-flash-native-audio-preview` (SDK bidi, baja latencia).
- **RAG:** 16 chunks vectorizados en Supabase (Embeddings v4). Savara tiene "Memoria de Elefante".
- **Operación Hydra:** Pool de 4 API Keys con failover automático. Blueprint para escalabilidad en Multiversa.

## 🛡️ Security & Resilience

- **Device Lock:** Cryptographic binding a `MachineID` vía JWT.
- **CORS Fix:** Edge Functions securizadas y optimizadas para producción.
- **Offline-First:** Validación JWT y cache de tasas (Modo Búnker) 100% operativos.

## 🎨 UI/UX Aesthetic: Liquid Glass

- **Theme:** Dark Opal (#050505 base).
- **Effects:** Backdrop blur, translucent panels, neon-lime accents.
- **Layout:** Thumb-zone optimization (all main controls in the bottom third).

## 🛡️ Security

- **Device Lock:** Cryptographic binding to `MachineID`.
- **Validation:** Offline-first JWT verification.

---

# Multiversa Lab: **PORTALITY (Elevat OS)**

**Estado:** Alpha V1 (Dockerized)
**Last Updated:** Jan 3, 2026

## 🎯 Visión

El "Verdadero Portality" nacido del laboratorio para **Elevat** (Andrea & Christian).

- **Core:** Dashboard "Liquid Glass" conectado a Notion (Headless).
- **IA:** Aureon (Gemini 2.0 Flash Exp) para voz y chat.
- **Arquitectura:** Dockerizada y Clonable.

## 🏗️ Infraestructura (Lab)

- **Frontend:** React 19 + Vite + Tailwind 4 (Portality Container).
- **Backend/MCP:** Multiversa MCP Server (Node.js).
- **RAG:** `ragService` implementado con soporte híbrido (Supabase + Memoria). _Vectorización real pendiente de ingesta masiva._
- **Automations:** n8n + Flowise (Railway) [En proceso de enlace].

## 📦 Docker & Deploy

- **Container:** `portality-elevat` (Node 20 Alpine).
- **Puerto:** 3000.
- **Estrategia:** Despliegue aislado para versionamiento seguro.
