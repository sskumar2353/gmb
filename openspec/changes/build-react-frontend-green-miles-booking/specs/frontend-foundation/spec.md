## ADDED Requirements

### Requirement: Frontend project foundation and structure
The system SHALL provide a React + Vite + Tailwind frontend codebase with a clean, scalable folder structure for components, pages, routes, state, services, data, hooks, utils, and assets.

#### Scenario: Initialize project foundation
- **WHEN** a developer sets up the application
- **THEN** the project SHALL include the required directories and baseline application entry points for routing and shared layout

### Requirement: Route-based navigation shell
The system MUST expose route mappings for all core user journeys and render the correct page module for each path.

#### Scenario: Navigate to a defined route
- **WHEN** a user visits a supported route path
- **THEN** the application SHALL render the associated page without full page reload

### Requirement: Backend-ready frontend boundaries
The system SHALL separate presentation, state, and service layers so backend integration can be introduced without rewriting page-level UI.

#### Scenario: Replace mock service with real API
- **WHEN** a service endpoint is migrated from mock implementation to real API call
- **THEN** route/page components MUST continue to function with only service-layer changes
