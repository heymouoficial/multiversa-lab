# PORTALITY: El Conductor (Elevat OS)

**Este documento es la FUENTE DE LA VERDAD TÉCNICA para Portality.**
Define la arquitectura exacta, integraciones y flujos de datos.

---

## 🎯 Visión

Portality no es solo un dashboard; es el Sistema Operativo vivo de Elevat.
Su objetivo es centralizar operaciones, automatizar flujos y servir como interfaz para Aureon.

## 🏗️ Arquitectura del Sistema

### 1. El Cerebro: AUREON (Polimata)

- **Modelo:** Gemini 2.0 Flash (vía `geminiService.ts`)
- **Capacidades:**
  - **Conversacional:** Memoria de contexto Elevat/ÁGORA.
  - **UI2Gen:** Genera interfaces (listas, confirmaciones) en el chat.
  - **Action Engine:** Ejecuta acciones reales en APIs (Vercel, Notion\*).
  - **Voice:** Capa de voz bidireccional (Futuro cercano).

### 2. El Espejo: NOTION ↔ SUPABASE

**Principio Fundamental:** "Lo que pasa en Portality, pasa en Notion. Lo que pasa en Notion, pasa en Portality."

- **Bidireccionalidad:**
  - **Portality → Notion:** Via Supabase Triggers + n8n Webhooks.
  - **Notion → Portality:** Via n8n Webhooks → Supabase Upsert.
- **Schema:**
  - Tablas: `clients`, `tasks`, `services`.
  - ID Mapping: Columna `notion_id` en todas las tablas clave.

### 3. La Infraestructura (Stack)

- **Frontend:** React 19 + Vite + Tailwind 4 (Containerizado).
- **Backend:** Supabase (Auth, DB, Vector Store, Realtime).
- **Integraciones:**
  - **Vercel SDK:** Para gestión de variables de entorno en producción.
  - **Notion SDK:** Para lectura/escritura directa (cuando n8n no es suficiente).
  - **OpenRouter/Gemini:** Para inteligencia.

---

## 📂 Estructura de "La Verdad" (Directorios)

- `/components`: UI Blocks (Liquid Glass aesthetic).
- `/services`: Lógica de negocio pura.
  - `geminiService.ts`: Cerebro de Aureon.
  - `vercelService.ts`: Control de infraestructura.
  - `ragService.ts`: Memoria vectorizada.
- `/knowledge`: Documentos fuente para RAG (MD files).
- `/config`: Constantes, Branding, API Keys.

---

## 🛡️ Protocolos de Error

1. **Fallback:** Si Supabase falla, UI degrada graciosamente (pero alerta).
2. **Types:** TypeScript estricto. `pnpm build` debe pasar siempre.
3. **Logs:** Aureon debe informar de errores en lenguaje natural.

---

**Estado Actual:**

- ✅ Base de Datos: Poblada (Seed data Elevat).
- ✅ Aureon: Conectado (Gemini 2.0).
- ✅ UI: Liquid Glass + Floating Chat v2.
- 🚧 Sync Notion: Pendiente configuración n8n.

**Próxima Misión:** Verificar integridad del código (`pnpm build`).
