# Plan de Implementación: Portality Brain RAG

**Estrategia:** Despliegue incremental priorizando la infraestructura de datos para luego conectar la UI y finalmente la lógica del agente.

## Fase 1: Infraestructura Sináptica (Backend & DB)
*Objetivo: Tener la capacidad de almacenar y buscar vectores funcional.*

- [x] **DB Setup:** Ejecutar SQL de `pgvector`, tabla `knowledge_base` e índices HNSW en Supabase SQL Editor. (Migration artifact: `supabase/migrations/20251229_portality_brain_rag.sql`)
- [x] **DB RPC:** Implementar función `match_documents` con lógica de filtrado por `machine_id`. (Included in migration artifact)
- [~] **Edge Function `ingest-file`:**
    - [x] Configurar proyecto Deno local.
    - [ ] Implementar parser `@pdf/pdftext`. (Pending robust solution, current implementation accepts text)
    - [x] Integrar SDK de Google Generative AI para embeddings (`text-embedding-004`).
    - [x] Implementar lógica de guardado en Supabase.
    - [ ] Desplegar función: `supabase functions deploy ingest-file`. (User action required)

> **👮‍♂️ Verificación Conductor:**
> 1. Usar Postman para enviar un PDF a la Edge Function.
> 2. Verificar en Supabase Table Editor que existen filas en `knowledge_base` con vectores poblados.
> 3. Ejecutar manualmente la RPC `match_documents` con un vector dummy y verificar que no da error.

## Fase 2: Interfaz de Gestión (Portality UI)
*Objetivo: Permitir al admin gestionar el "cerebro" del agente sin tocar SQL.*

- [x] **Componente `KnowledgeManager`:** Crear vista en el panel admin.
- [x] **Upload UI:**
    - [x] Implementar Drag & Drop zone.
    - [x] Conectar con Edge Function `ingest-file`.
    - [x] Manejo de errores y estado de carga ("Asimilando conocimiento...").
- [x] **Visualización de Memoria:**
    - [x] Fetch de tabla `knowledge_base`.
    - [x] Implementar borrado de memoria (Row Delete).
- [x] **Actualización Licencias:** Añadir campo `user_name` al crear/editar licencias para asociar identidad.

> **👮‍♂️ Verificación Conductor:**
> 1. Subir un archivo "manual_seguridad.pdf" desde Portality.
> 2. Confirmar que aparece en la lista de "Memorias".
> 3. Borrar el archivo y verificar que desaparece de la DB.

## Fase 3: Integración Sináptica (Savara Connection)
*Objetivo: Que Savara "recuerde" y use la información.*

- [x] **Vectorización de Consulta:** En `geminiService`, añadir paso para vectorizar el input del usuario (usando misma API de embedding que en ingestión).
- [x] **Lógica RAG:**
    - [x] Consultar `supabase.rpc('match_documents', { ... })`.
    - [x] Filtrar por `machine_id` almacenado en el `localStorage` o contexto de la licencia activa.
- [x] **Prompt Injection:**
    - [x] Modificar construcción del prompt en `useSavaraLive` (Actually implemented in `geminiService` for text chat which is the primary RAG target for now).
    - [x] Inyectar contexto recuperado de forma transparente al usuario.

> **👮‍♂️ Verificación Conductor:**
> 1. Subir un dato oscuro al sistema (ej: "La clave secreta del proyecto es 'Omega-3'").
> 2. Preguntar a Savara: "¿Cuál es la clave del proyecto?".
> 3. **Éxito:** Savara responde "Omega-3" (información que no está en su entrenamiento base).
> 4. **Fallo:** Savara alucina o dice no saber.
