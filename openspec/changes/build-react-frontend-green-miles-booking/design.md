## Context

Green Miles requires a frontend-only product experience that demonstrates end-to-end booking and courier journeys without backend dependencies. The project must be production-structured from day one so APIs can be integrated later with minimal refactoring. The main constraints are UI-only scope, reusable architecture, consistent design language, and clean routing/state boundaries for future scaling.

## Goals / Non-Goals

**Goals:**
- Establish a React + Vite + Tailwind frontend foundation with clear module boundaries.
- Deliver complete navigable user flows for ride booking and courier requests using mock data.
- Build reusable component primitives and layouts to support feature growth.
- Keep service and state layers backend-ready through well-defined interfaces.
- Apply a modern SaaS dark theme with blue + green visual hierarchy.

**Non-Goals:**
- Implement real authentication, payment gateway, or backend persistence.
- Build server-side APIs, database schema, or deployment pipelines.
- Optimize for production telemetry, analytics, or advanced accessibility compliance in this phase.

## Decisions

1. **Frontend Stack: React + Vite + Tailwind**
   - Rationale: Fast iteration, strong ecosystem, and utility-first styling for consistent UI development speed.
   - Alternative considered: Next.js; rejected for this phase because SSR and server features are unnecessary for a UI-only prototype.

2. **Routing-first architecture using React Router**
   - Rationale: Explicit route-based feature segmentation for clear page ownership and future code splitting.
   - Alternative considered: Single-page state switcher; rejected due to poor scalability and weaker deep-link support.

3. **State boundary with modular store + feature-local UI state**
   - Rationale: Shared domain state (user, rides, booking selections) should be centralized while form-level state remains local to pages/components.
   - Alternative considered: Prop-drilling only; rejected due to maintainability overhead across many page transitions.

4. **Service adapter layer for mock-first APIs**
   - Rationale: Introduce `services/` contracts now (e.g., get rides, post bookings, post payments) so backend integration later becomes endpoint swapping instead of UI rewrites.
   - Alternative considered: Inline mock objects per page; rejected because it couples data concerns to presentation and blocks testability.

5. **Reusable design system primitives before page expansion**
   - Rationale: Core components (Button, Input, Card, Badge, Modal, Loader, Toast, Layout) reduce inconsistency and future refactors.
   - Alternative considered: Page-specific styling and controls; rejected because duplication compounds with dashboard/courier/booking pages.

## Risks / Trade-offs

- **[Risk] Mock behavior diverges from real backend responses** -> **Mitigation:** Define consistent service response shape and endpoint placeholders from the start.
- **[Risk] UI complexity grows faster than component quality** -> **Mitigation:** Enforce component reuse and keep visual tokens centralized.
- **[Risk] Over-engineering for backend readiness slows delivery** -> **Mitigation:** Keep API contracts lightweight and defer only to confirmed integration needs.
- **[Trade-off] Faster UI completion vs. deeper edge-case validation** -> **Mitigation:** Capture edge cases as future tasks while ensuring core user journeys are complete and testable.
