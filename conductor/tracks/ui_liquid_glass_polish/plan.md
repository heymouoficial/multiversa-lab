# Plan: UI/UX Revolution - Liquid Glass Polish

**Strategy:** Pure CSS/Component styling update. No logic touches.

## Phase 1: Fundamentos (The Stage)
*Goal: Set the atmosphere.*

- [ ] **Configuración Tailwind:** Update `CalculaTu/index.css` with `@theme` variables for Dark Opal palette.
- [ ] **Global Background:** Implement a subtle animated mesh gradient or deep radial gradient in `index.css`.
- [ ] **Typography:** Ensure `Plus Jakarta Sans` is applied globally with correct weights for high contrast.

> **👮‍♂️ Verificación Conductor:**
> 1. Open App. Background should be deep dark (not flat black).
> 2. Text should be legible white/grey-400.

## Phase 2: La Máquina (The Keypad)
*Goal: Make the calculator feel like a tactical device.*

- [ ] **Calculator View:** Refactor `CalculatorView.tsx` (or `App.tsx` dock section) to use the new Button styles.
- [ ] **Glass Inputs:** Style the main display/input field as a clean glass pane with large typography.
- [ ] **Sticky Header:** Ensure the top total bar is a true glass panel (`backdrop-blur-xl`) that content scrolls under.

> **👮‍♂️ Verificación Conductor:**
> 1. Press keys. Verify "tactile" feedback (scale/color shift).
> 2. Scroll list. Verify blur effect in header.

## Phase 3: La Conversación (The Chat)
*Goal: Elevate the AI interaction.*

- [ ] **Chat Widget:** Update `ChatWidget.tsx` message bubbles (User vs Savara styles).
- [ ] **The Orb (Mic):** Redesign the microphone button in `App.tsx` / `Dock`. Make it float and pulse.
- [ ] **Product List:** Update `DemoCard` to be transparent glass slivers instead of solid cards.

> **👮‍♂️ Verificación Conductor:**
> 1. Send a voice message. Verify the Orb's pulse animation.
> 2. Check chat readability against the glass background.