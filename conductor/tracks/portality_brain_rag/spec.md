# Spec: Portality Brain RAG

## Contexto
Transformar "Portality" en un centro de gestión de conocimiento (RAG) para Savara. El objetivo es permitir que la IA tenga memoria a largo plazo y contexto específico, tanto global (reglas de negocio) como privado por usuario (`machine_id`).

## Arquitectura de Datos (Supabase)

### 1. Extensiones
- `vector`: Requerido para almacenar embeddings.

### 2. Tabla `knowledge_base`
Almacena fragmentos de información vectorizada.
```sql
create table knowledge_base (
  id bigserial primary key,
  content text, -- El texto original
  metadata jsonb, -- { "source": "manual.pdf", "type": "pdf", "machine_id": "xyz", "scope": "global/private" }
  embedding vector(768) -- Gemini text-embedding-004 dimension
);
```

### 3. Función RPC `match_documents`
Búsqueda semántica con filtrado de seguridad.
```sql
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_machine_id text default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) as similarity
  from knowledge_base kb
  where 1 - (kb.embedding <=> query_embedding) > match_threshold
  and (
      (kb.metadata->>'scope' = 'global') 
      OR 
      (kb.metadata->>'machine_id' = filter_machine_id)
  )
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## Infraestructura Edge (Deno)

### Edge Function: `ingest-file`
- **Input:** `FormData` (archivo .txt, .pdf, .md).
- **Proceso:**
    1. **Auth:** Validar Token de Admin (Portality).
    2. **Parse:** Extraer texto plano. (Usar `pdf-parse` o similar compatible con Edge/Deno).
    3. **Chunking:** Dividir texto en bloques de ~1000 caracteres con solapamiento.
    4. **Embedding:** Llamar a Google Generative AI API (`models/text-embedding-004`) para cada chunk.
    5. **Store:** Insertar en tabla `knowledge_base` con `metadata`.

## Frontend (Portality UI)

### Componente `KnowledgeManager`
- **Drag & Drop Zone:** Área para subir archivos.
- **Lista de Memorias:** Tabla mostrando archivos ingestados.
    - Columnas: Nombre, Tipo, Ámbito (Global/Privado), Fecha.
    - Acciones: Eliminar (Borra todos los chunks asociados a ese `source`).

### Módulo "Forjado de Licencias" (Update)
- Añadir campo `user_name` al formulario de creación de licencias.
- Guardar este nombre en la tabla `contracts` o `profiles` para que Savara pueda personalizar el saludo.

## Integración RAG (Savara)

### Flujo de Consulta (`useSavaraLive` / `geminiService`)
1. **Intercept:** Antes de enviar el mensaje del usuario a Gemini.
2. **Vectorize:** Generar embedding del mensaje del usuario (`text-embedding-004`).
3. **Retrieve:** Llamar a `rpc/match_documents` enviando el vector y el `machine_id` actual.
4. **Augment:** Si hay resultados con `similarity > 0.5`, inyectar en el System Prompt:
   ```text
   CONTEXTO RECUPERADO (MEMORIA):
   - ...fragmento 1...
   - ...fragmento 2...
   Responde usando este contexto si es relevante.
   ```
