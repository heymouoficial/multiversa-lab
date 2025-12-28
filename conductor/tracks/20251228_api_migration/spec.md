# Specification: Migración de Quota y Optimización Free Tier (Proyecto CalculaTu)

| Atributo | Detalle |
| :--- | :--- |
| **Fecha** | 2025-12-27 |
| **Estado** | Propuesto |
| **Objetivo** | Restaurar el servicio de Savara mediante migración a nueva API Key y reducir consumo de cuota para operar dentro de los límites del Free Tier (15 RPM / 1,500 RPD). |
| **Proyecto Cloud** | `calculatu-482618` |
| **Impacto** | Crítico (Bloqueo de Servicio) |

## 1. Contexto y Problemática
El proyecto actual ha sufrido un bloqueo por **"429 Resource Exhausted"**. La cuota del Free Tier de Google es estricta y se aplica a nivel de Proyecto de Google Cloud. Hemos aprovisionado un nuevo proyecto (`calculatu-482618`) para obtener una API Key limpia.

Para evitar un nuevo bloqueo, no basta con rotar la llave; debemos forzar el uso de modelos "Flash" (menor costo/mayor límite) e implementar mecanismos de defensa en el cliente (desconexión automática y manejo de errores).

## 2. Requerimientos Técnicos

### 2.1. Migración de Credenciales
*   **Rotación Segura:** La nueva API Key no debe ser commiteada al repositorio. Se debe inyectar exclusivamente mediante variables de entorno (`.env.local` en desarrollo y Environment Variables en Vercel).
*   **Alcance:** Afecta a todo el stack que consuma `GoogleGenerativeAI` o `useSavaraLive`.

### 2.2. Enforzamiento del Modelo (Flash Strategy)
*   **Modelo Objetivo:** Se utilizará `gemini-1.5-flash-latest` (o su equivalente activo `gemini-2.5-flash-lite` si el 1.5 está deprecado en la región, ya que ambos ofrecen ~15 RPM en Free Tier vs las 2-5 RPM del Pro).
*   **Refactorización:**
    *   `services/geminiService.ts`: Hardcodear la configuración del modelo para evitar fallbacks a modelos Pro.
    *   `hooks/useSavaraLive.ts`: Asegurar que la conexión WebSocket solicite explícitamente el modelo Flash.

### 2.3. Mecanismo de Ahorro "Time-Bomb" (Silence Detection)
Para conservar RPD (Requests Per Day) y ancho de banda, la sesión de Live API no debe permanecer abierta indefinidamente si el usuario no interactúa.
*   **Lógica:** Si no se detecta actividad de audio (input del usuario) o respuesta del modelo durante **60 segundos**, se debe cerrar la conexión WebSocket.
*   **Feedback UI:** Mostrar un estado visual discreto (ej: "Sesión pausada por inactividad").

### 2.4. Manejo de Errores (Graceful Degradation 429)
Cuando la API retorne un error `429 RESOURCE_EXHAUSTED`:
*   **Acción Inmediata:** Detener intentos de reconexión automática (Exponential Backoff agresivo o detención total).
*   **Feedback UI:** Disparar un componente Toast con el mensaje: *"Savara está descansando. Intenta en 1 min"*.
*   **Prevención:** Evitar el "bucle de muerte" donde el cliente reintenta infinitamente quemando la cuota apenas se restablece.

## 3. Consideraciones de Arquitectura
*   **Nota sobre Modelos:** Según release notes recientes, `gemini-1.5-flash` podría estar en proceso de shutdown en favor de `gemini-2.5-flash-lite`. Si `1.5-flash-latest` retorna 404, se deberá cambiar inmediatamente a `gemini-2.5-flash-lite` que mantiene el límite de 15 RPM.
*   **Límite de Proyecto:** Recordar que la cuota es por Proyecto de Google Cloud, no por Key. Rotar keys dentro del mismo proyecto `CalculaTu` no servirá si se satura.

## 4. Definición de Hecho (DoD)
1.  Chat funcional con la nueva API Key.
2.  Network tab muestra requests saliendo hacia el modelo Flash.
3.  Desconexión automática verificada tras 60s de silencio.
4.  Simulación de error 429 muestra el Toast correcto.
