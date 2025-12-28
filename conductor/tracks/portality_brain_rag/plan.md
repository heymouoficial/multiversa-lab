# Plan de Implementación: Portality Brain RAG

**Estrategia:** Despliegue incremental priorizando la infraestructura de datos para luego conectar la UI y finalmente la lógica del agente.

## Fase 1: Infraestructura Sináptica (Backend & DB)
*Objetivo: Tener la capacidad de almacenar y buscar vectores funcional.*

- [ ] **DB Setup:** Ejecutar SQL de `pgvector`, tabla `knowledge_base` e índices HNSW en Supabase SQL Editor. (Guardar migración en `supabase/migrations`).
- [ ] **DB RPC:** Implementar función `match_documents` con lógica de filtrado por `machine_id`.
- [ ] **Edge Function `ingest-file`:**
    - [ ] Configurar proyecto Deno local.
    - [ ] Implementar parser básico (TXT/MD primero, investigar PDF).
    - [ ] Integrar SDK de Google Generative AI para embeddings (`text-embedding-004`).
    - [ ] Implementar lógica de guardado en Supabase.
    - [ ] Desplegar función: `supabase functions deploy ingest-file`.

> **👮‍♂️ Verificación Conductor:**
> 1. Usar Postman para enviar un texto a la Edge Function.
> 2. Verificar en Supabase Table Editor que existen filas en `knowledge_base` con vectores poblados.
> 3. Ejecutar manualmente la RPC `match_documents` con un vector dummy y verificar que no da error.

## Fase 2: Interfaz de Gestión (Portality UI)
*Objetivo: Permitir al admin gestionar el "cerebro" del agente sin tocar SQL.*

- [ ] **Componente `KnowledgeManager`:** Crear vista en el panel admin.
- [ ] **Upload UI:**
    - [ ] Implementar Drag & Drop zone.
    - [ ] Conectar con Edge Function `ingest-file`.
    - [ ] Manejo de errores y estado de carga ("Asimilando conocimiento...").
- [ ] **Visualización de Memoria:**
    - [ ] Fetch de tabla `knowledge_base`.
    - [ ] Implementar borrado de memoria (Row Delete).
- [ ] **Actualización Licencias:** Añadir campo `user_name` al crear/editar licencias para asociar identidad.
- [ ] **Herramientas de Gestión (Admin Tools):**
    - [ ] **Tasas en Tiempo Real:** Tabla editable para actualizar tasas manualmente si la API falla.
    - [ ] **Calendario Free Pass:** UI para seleccionar fecha y activar acceso libre global.
    - [ ] **Logs de Sistema:** Visor en tiempo real de logs de Supabase (Auth, Errores, Vectorización).
    - [ ] **Historial Avanzado:** Filtros de 1d, 3d, 7d para visualizar actividad.

> **👮‍♂️ Verificación Conductor:**
> 1. Subir un archivo "manual_seguridad.txt" desde Portality.
> 2. Confirmar que aparece en la lista de "Memorias".
> 3. Borrar el archivo y verificar que desaparece de la DB.

## Fase 3: Integración Sináptica (Savara Connection)
*Objetivo: Que Savara "recuerde" y use la información.*

- [ ] **Vectorización de Consulta:** En `geminiService`, añadir paso para vectorizar el input del usuario (usando misma API de embedding que en ingestión).
- [ ] **Lógica RAG:**
    - [ ] Consultar `supabase.rpc('match_documents', { ... })`.
    - [ ] Filtrar por `machine_id` almacenado en el `localStorage` o contexto de la licencia activa.
- [ ] **Prompt Injection:**
    - [ ] Modificar construcción del prompt en `useSavaraLive` / `SavaraChat`.
    - [ ] Inyectar contexto recuperado de forma transparente al usuario.

> **👮‍♂️ Verificación Conductor:**
> 1. Subir un dato oscuro al sistema (ej: "La clave secreta del proyecto es 'Omega-3'").
> 2. Preguntar a Savara: "¿Cuál es la clave del proyecto?".
> 3. **Éxito:** Savara responde "Omega-3" (información que no está en su entrenamiento base).
> 4. **Fallo:** Savara alucina o dice no saber.