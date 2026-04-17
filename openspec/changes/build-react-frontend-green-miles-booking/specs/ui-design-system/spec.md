## ADDED Requirements

### Requirement: Dark-theme SaaS visual system
The system SHALL implement a modern dark-theme interface using blue + green visual hierarchy across layout surfaces, cards, typography, controls, and state indicators.

#### Scenario: Render themed page surfaces
- **WHEN** any page is loaded
- **THEN** primary and secondary surfaces MUST follow the defined dark palette and maintain visual consistency

### Requirement: Reusable UI primitives
The system MUST provide reusable component primitives including button variants, form controls, card, badge, modal, loader, and toast patterns.

#### Scenario: Compose page with shared components
- **WHEN** a page requires actions, forms, and feedback elements
- **THEN** it SHALL use shared UI primitives instead of page-specific ad hoc components

### Requirement: Responsive modern interactions
The system SHALL support responsive layouts and smooth interaction feedback suitable for mobile-first SaaS usability.

#### Scenario: Interact on mobile viewport
- **WHEN** a user accesses the app on smaller screen widths
- **THEN** key navigation and forms MUST remain readable, tappable, and functionally complete
