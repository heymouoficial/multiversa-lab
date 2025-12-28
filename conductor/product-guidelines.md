# Product Guidelines: CalculaTú

## UX Imperatives
1. **The Thumb Zone Rule:** All primary actions (Add, Pay, Mic) must be reachable with the thumb in the bottom 30% of the screen.
2. **Latency Zero:** UI feedback must occur in <100ms. Use skeletons and optimistic updates.
3. **Bunker Mode:** App must be usable without internet. Assume 24h stale rate for BCV if offline.

## Design System (Liquid Glass)
- **Background:** Mesh gradients, never solid black.
- **Panels:** `bg-white/5` + `backdrop-blur-xl` + `border-white/10`.
- **Accents:** Neon Lime (#ccff00) for success/action, Emerald for trust, Purple for Savara.

## Security Standards
- Never log user license tokens or machine IDs in production logs.
- All license validation is local and cryptographic.
- Use `machineID` as the primary key for user context, not email.