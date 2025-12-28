# Product Context: CalculaTú (Supermarket Survival)

**Current Version:** Beta 1.0 (Live)
**Last Updated:** Dec 28, 2025

## 🎯 Core Value Proposition
A "Mobile-First Agresiva" financial survival tool for Venezuelan consumers. 
- **Offline-First:** Critical functionality works without internet (Mode Bunker).
- **Voice-First:** "Savara AI" acts as a shopping co-pilot via audio.
- **Zero Friction:** One-handed usage, instant currency conversion.

## 💰 Monetization & Pricing Strategy (Launch Promo)

**1. Freepass (Trial)**
- **Cost:** Free.
- **Validity:** Until **January 1st, 2026** (New Year's Gift).
- **Benefit:** Full access to Savara Pro features for free during this period.
- **Trigger:** Auto-activated via "PromotionBanner" component.

**2. Monthly Plan (Pro Mensual)**
- **Current Promo:** **$1 / month** (Regular Price: $3).
- **Offer Valid Until:** January 1st, 2026.
- **Limits:** 30 Minutes of Voice Interaction / month.
- **Features:** Voice Assistant, Purchase History, offline sync.

**3. Lifetime Plan (Pro Lifetime)**
- **Current Promo:** **$10 One-time** (Regular Price: $20).
- **Offer Valid Until:** **January 31st, 2026**.
- **Limits:** 60 Minutes of Voice Interaction / month (Renewed monthly forever).
- **Features:** Priority Support, Early Access, No monthly fees ever.

## 🧠 AI Personality (Savara)
- **Role:** Efficient Shopping Assistant.
- **Tone:** Concise (max 30 words), helpful, Venezuelan context-aware.
- **Knowledge:** Real-time BCV rates, pricing conversion logic.
- **Prompt Logic:** System prompt is dynamically injected with current pricing/promo data (see `services/geminiService.ts`).

## 🛡️ Security & Licensing
- **Device Lock:** Licenses are cryptographically bound to `MachineID` (Browser Fingerprint).
- **Anti-Warp:** Prevents session cloning/sharing.
- **Validation:** Offline-first validation using signed JWTs (Tokens).

## ⚡ Quota & Performance Optimization (Free Tier)
- **Flash Model Strategy:** Enforces the use of `gemini-1.5-flash-latest` to maximize RPM (15 RPM) and minimize costs.
- **Time-Bomb (Silence Detection):** Automatic WebSocket disconnection after 60 seconds of inactivity to preserve RPD (Requests Per Day).
- **Graceful Degradation:** Implementation of error handling for `429 Resource Exhausted` with user-friendly feedback (Toasts).

## 📂 Key File Locations
- **Pricing UI:** `CalculaTu/App.tsx` (Pricing Section).
- **Promo Logic:** `CalculaTu/components/PromotionBanner.tsx`.
- **System Prompt:** `CalculaTu/services/geminiService.ts`.
- **License Logic:** `CalculaTu/utils/license.ts` & `CalculaTu/store/useLicenseStore.ts`.

---

# Broader Ecosystem (Multiversa Lab)
*Legacy Context*
Multiversa Lab orchestrates this ecosystem. Other projects include:
- **HeyMode:** Wellness & Consciousness.
- **Multiversa:** Business Automation.