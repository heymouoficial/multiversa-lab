# Spec: UI/UX Revolution - Liquid Glass Polish

## Vision
Elevate "CalculaTú" to a premium "Liquid Glass" artifact. Aesthetic: Dark Opal (Cyberpunk/VisionOS), translucent, tactile, neon-accented. NO LOGIC CHANGES.

## Design Tokens (Tailwind v4)

### 1. Palette: "Dark Opal"
*   **Bg Base:** `#0a0a0a` (Rich Black) to `#121212` (Dark Charcoal).
*   **Deep Purple:** `#8b5cf6` (Primary Accent/Brand).
*   **Neon Lime:** `#ccff00` (Action/Success).
*   **Glass White:** `rgba(255, 255, 255, 0.05)` (Base Panels).

### 2. Utility Classes (CSS/Tailwind)
**`.glass-panel`**
```css
@apply bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl;
box-shadow: 
  0 4px 30px rgba(0, 0, 0, 0.1),
  inset 0 0 0 1px rgba(255, 255, 255, 0.05);
```

**`.neon-text`**
```css
@apply text-[#ccff00] drop-shadow-[0_0_5px_rgba(204,255,0,0.5)];
```

### 3. Component Styles

**The Calculator Keypad**
*   **Button Base:** `h-16 w-full rounded-2xl bg-white/5 border border-white/5 text-2xl font-medium transition-all duration-200`.
*   **Hover:** `hover:bg-white/10 hover:scale-[1.02]`.
*   **Active:** `active:scale-95 active:bg-white/20`.
*   **Action Key (Confirm/Pay):** `bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00]/30`.

**The Chat (Savara)**
*   **Bubble (User):** `bg-white/10 rounded-tr-none text-right self-end`.
*   **Bubble (Savara):** `bg-[#8b5cf6]/20 border border-[#8b5cf6]/20 rounded-tl-none self-start`.
*   **Mic Orb:** Floating Action Button (64px). Gradient bg (Purple->Pink). 
    *   **Animation:** `animate-pulse` + `ring-4 ring-purple-500/30`.

## Implementation Strategy
Use Tailwind v4 `@theme` in `index.css` for variables. Apply utility classes directly to components.