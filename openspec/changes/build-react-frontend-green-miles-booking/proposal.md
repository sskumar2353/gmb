## Why

Green Miles needs a polished, frontend-only product shell to validate user journeys for ride booking and courier services before backend implementation. Building this now enables faster stakeholder demos, UX iteration, and clear contracts for future API integration.

## What Changes

- Create a React + Vite + Tailwind frontend foundation with scalable project structure and reusable UI architecture.
- Implement a modern dark-theme SaaS design system using a blue + green palette across layout, forms, cards, and feedback states.
- Add route-based page flow for booking and courier journeys: landing, auth, search, results, ride detail, booking, payment, confirmation, dashboard, and courier.
- Build reusable component primitives (layout and UI components) to reduce duplication and support future feature expansion.
- Integrate mock data/services to simulate rides, bookings, and payment states without backend dependencies.
- Prepare frontend service and state layers for future backend connectivity (API client wrappers, typed data flow conventions, and modular page composition).

## Capabilities

### New Capabilities
- `frontend-foundation`: React/Vite/Tailwind application scaffold with clean, scalable folder and module boundaries.
- `ui-design-system`: Reusable dark-theme component set and visual tokens for consistent modern SaaS UI.
- `booking-user-flow`: End-to-end UI routing and interactions for ride discovery, selection, booking, and payment confirmation.
- `courier-user-flow`: Dedicated courier request UI with mock fare estimation and confirmation experience.
- `mock-data-services`: UI-only mock service layer and state management patterns for backend-ready integration.

### Modified Capabilities
- None.

## Impact

- Affected code: Entire frontend application codebase (`src/`), routing, reusable components, page modules, and mock service modules.
- APIs: No real APIs invoked; placeholders and mock handlers only.
- Dependencies: React, Vite, Tailwind CSS, React Router, state management library, and optional UI utility packages.
- Systems: No backend/database changes; frontend-only implementation designed for later API wiring.
