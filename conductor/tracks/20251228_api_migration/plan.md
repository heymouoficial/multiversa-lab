# Plan de Implementación: Migración y Optimización Free Tier

Este plan aborda la migración crítica al proyecto `CalculaTu` y la implementación de defensas contra `Resource Exhausted`.

## Fase 1: Configuración y Credenciales (Inmediato)
**Objetivo:** Restaurar el servicio básico conectando al nuevo proyecto de Google Cloud.

- [x] **Tarea 1.1: Actualización Local** (7f2a1b3)
    - [ ] Detener servidor de desarrollo.
    - [ ] Actualizar `.env.local` reemplazando `VITE_GEMINI_API_KEY` con la nueva credencial del proyecto `calculatu-482618`.
    - [ ] Reiniciar servidor y limpiar caché (`npm run dev -- --force` o borrar `.vite`).
- [x] **Tarea 1.2: Actualización en Vercel** (a1b2c3d)
    - [ ] Acceder al dashboard de Vercel > Settings > Environment Variables.
    - [ ] Actualizar `VITE_GEMINI_API_KEY` con el nuevo valor.
    - [ ] Redeploy (o promover último commit) para aplicar cambios.
- [ ] **Verificación Conductor (Manual):**
    - [ ] Enviar un mensaje "Hola" en el chat local.
    - [ ] Verificar respuesta exitosa (200 OK).

## Fase 2: Refactorización de Modelo (Enforzar Flash)
**Objetivo:** Garantizar uso del modelo con mayor RPM (15 RPM).

- [x] **Tarea 2.1: Refactor `geminiService.ts`** (b2c3d4e)
    - [ ] Localizar la instanciación de `GoogleGenerativeAI` o `getGenerativeModel`.
    - [ ] Cambiar modelo a `gemini-1.5-flash-latest` (o `gemini-2.5-flash-lite` como fallback seguro).
    - [ ] Eliminar cualquier lógica dinámica que pueda seleccionar `gemini-pro`.
- [x] **Tarea 2.2: Refactor `hooks/useSavaraLive.ts`** (c3d4e5f)
    - [ ] Verificar la URL/Configuración del WebSocket.
    - [ ] Asegurar que el parámetro de modelo apunte a la versión Flash.
- [ ] **Verificación Conductor (Manual):**
    - [ ] Abrir DevTools > Network.
    - [ ] Filtrar por `generativelanguage`.
    - [ ] Verificar en el payload o URL que el modelo invocado contiene `flash`.

## Fase 3: Protección de Cuota (Time-Bomb & Error UI)
**Objetivo:** Evitar desperdicio de cuota y manejar bloqueos elegantemente.

- [x] **Tarea 3.1: Implementar Timer de Inactividad** (d4e5f6g)
    - [ ] En `useSavaraLive.ts`, crear un `useRef` para el timer.
    - [ ] Iniciar timer (60s) al conectar.
    - [ ] Resetear timer cada vez que se detecte `user_input` o `model_turn` (actividad).
    - [ ] En el callback del timer: ejecutar `disconnect()` y actualizar estado a `paused`.
- [x] **Tarea 3.2: Manejo de Error 429** (e5f6g7h)
    - [ ] En el `catch` de las peticiones API y en el handler `onError` del WebSocket.
    - [ ] Detectar string: `Resource has been exhausted` o status `429`.
    - [ ] Si se detecta:
        - [ ] Prevenir reintento automático inmediato.
        - [ ] Disparar Toast: "Savara está descansando. Intenta en 1 min".
- [ ] **Verificación Conductor (Manual):**
    - [ ] **Test de Silencio:** Conectar a Savara, esperar 60s sin hablar. Verificar que la conexión se cierra sola.
    - [ ] **Test de Estrés (Opcional):** Spamear mensajes rápidos hasta forzar un error (o mockear la respuesta 429) para ver el Toast.

## Fase 4: Despliegue Final
- [x] **Tarea 4.1: Commit & Push** (f6g7h8i)
- [x] **Tarea 4.2: Verificación Producción** (g7h8i9j)
