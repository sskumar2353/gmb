## ADDED Requirements

### Requirement: Mock data source for UI rendering
The system SHALL provide mock ride, booking, and payment data sources to support all user-facing pages without backend dependencies.

#### Scenario: Load initial data from mock source
- **WHEN** the user opens a page requiring domain data
- **THEN** the page MUST render using mock responses without external API access

### Requirement: Service contract placeholders
The system MUST define frontend service functions that mirror planned backend endpoints for rides, bookings, and payments.

#### Scenario: Invoke service placeholder
- **WHEN** a page triggers a data operation such as loading rides or creating a booking
- **THEN** the call SHALL go through a service-layer interface with consistent request/response shape

### Requirement: Predictable mock response states
The system SHALL support deterministic success/failure mock outcomes for UI validation of loading, empty, success, and error states.

#### Scenario: Validate payment failure path
- **WHEN** a mock payment operation is configured to fail
- **THEN** the UI MUST surface failure feedback while preserving user context for retry
