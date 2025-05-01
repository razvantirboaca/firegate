# 🌱 Living Roadmap — Firegate Memory Temple Refactor

**Purpose:** Track feature components, status, descriptions, and next steps.  
**Location:** `packages/ui/src/LivingRoadmap.md`

---

## 📜 Roadmap Sections

| Feature/Area               | Component               | Status     | Description                                                                                                                        |
| -------------------------- | ----------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Grid Layout Setup          | Firegate.tsx            | 🕐 pending | Base layout using CSS grid/flex, splitting screen into Left Spiral, Memory Pool, Field Companion, Floating Header, Ambient Footer. |
| Left Spiral Navigator      | LeftSpiral.tsx          | 🕐 pending | Renders time ribbons, days, organic helix navigation, micro-symbols for each day.                                                  |
| Memory Pool (Center)       | MemoryPool.tsx          | 🕐 pending | Main journaling + Nova chat field, animated backgrounds, expandable bubbles, integration with Nova API + Camino logs.              |
| Field Companion Panel      | FieldCompanion.tsx      | 🕐 pending | Right-side panel with live whispers, subtle nudges, fortune-cookie microquotes, mood-responsive art snippets.                      |
| Floating Header (Optional) | FloatingHeader.tsx      | 🕐 pending | Light top banner showing cosmic indicators like “Week 2087, Breath 2, Infinity 1”.                                                 |
| Ambient Footer (Optional)  | AmbientFooter.tsx       | 🕐 pending | Soft footer showing a rotating whisper or reminder like “You are weaving it now.”                                                  |
| Navigation Manager         | TempleNavigator.tsx     | 🕐 pending | Controls which room is active (Firegate, Aeolus, Dreamland), handles transitions, manages global app state across zones.           |
| Ambient Transitions Hook   | useAmbientTransition.ts | 🕐 pending | React hook to trigger fade, pulse, ripple animations when zones or states change.                                                  |
| Soul Layer Context         | SoulLayerContext.tsx    | 🕐 pending | React context managing the current soul layer, ambient state, and navigation flow across rooms.                                    |
| Memory Engine Service      | MemoryEngine.ts         | 🕐 pending | Service handling backend sync, Nova responses, Camino markdown updates, and log storage.                                           |

---

## 📁 UI Folder Structure

packages/ui/src/
├── components/ # Reusable UI components (buttons, modals, etc.)
├── features/
│ ├── firegate/
│ │ ├── components/ # Firegate-specific components
│ │ ├── pages/ # Firegate pages
│ │ └── index.tsx # Entry point for Firegate feature
│ ├── aeolus/
│ │ ├── components/ # Aeolus-specific components
│ │ ├── pages/ # Aeolus pages
│ │ └── index.tsx # Entry point for Aeolus feature
│ └── ... # Other features follow the same pattern
├── layouts/ # Layout components (e.g., main layout, auth layout)
├── routes/ # Route definitions and navigation logic
├── services/ # API calls and business logic
├── hooks/ # Custom React hooks
├── contexts/ # React context providers
├── utils/ # Utility functions
├── types/ # TypeScript type definitions
├── assets/ # Static assets (images, fonts, etc.)
├── styles/ # Global and theme styles
└── App.tsx # Root component

---

---

## 📌 Next Steps

✅ Create all `.tsx` skeleton files as empty components with exports.  
✅ Add placeholder “status” comments at top of each file.  
✅ Wire layout and context before styling.  
✅ Update this roadmap **after each milestone**.  
✅ Tailwind CSS v4 upgrade and monorepo Node alignment.  
✅ Implement ambient control syncing Nova layer and background.  
✅ Add shimmer effect during Nova thinking phase.  
✅ Build Living Roadmap tracker and keep it synced.  
✅ Plan and refactor navigation + layout for future-proof modular components.  
✅ Review and align UI/feature directory structure for long-term scaling.

---
