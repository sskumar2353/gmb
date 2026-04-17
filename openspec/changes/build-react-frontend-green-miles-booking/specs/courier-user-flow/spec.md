## ADDED Requirements

### Requirement: Courier request experience
The system SHALL provide a dedicated courier page where users can enter pickup/drop details and parcel parameters.

#### Scenario: Fill courier request form
- **WHEN** a user enters pickup, drop, and weight fields
- **THEN** the system MUST display a valid courier request form state ready for submission

### Requirement: Mock courier estimation
The system SHALL compute and display a mock courier price estimate based on entered form data.

#### Scenario: Update estimated cost
- **WHEN** a user changes courier input values such as weight
- **THEN** the displayed estimate MUST update to reflect the mock pricing logic
