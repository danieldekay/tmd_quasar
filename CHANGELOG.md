# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup with Quasar CLI
- Basic project structure and configuration
- WordPress integration setup
- Design documentation
- Quasar component integration:
  - Layout components (QPage, QLayout)
  - Navigation components (QHeader, QFooter)
  - Form components (QInput, QSelect)
  - Data display components (QTable, QCard)
  - Utility components (QDialog, QSpinner)
- **DJ Events & Performances feature**:
  - New "Events & Performances" tab in DJDetails.vue
  - Performance statistics display (total events, upcoming, countries,
    years active)
  - Upcoming and past events listing with navigation
  - Event filtering and chronological sorting
  - Interactive event cards with click-to-navigate functionality

### Improved

- Enhanced EventDetails venue tab with multi-column layout
- Added combined address display (venue name, street, city, country)
- Separated venue features into dedicated section
- Improved map integration with country-level zoom instead of close zoom
- Optimized mobile experience with priority content ordering
- **Enhanced DJ service with embedded events support**:
  - Added `_embed=true` parameter for DJ API calls
  - Implemented fallback mechanism for direct event fetching
  - Added proper TypeScript types for embedded events
  - Optimized API calls with performance-conscious data loading
- **Comprehensive API documentation updates**:
  - Documented DJ-Event relationships and bidirectional linking
  - Added v3 API endpoint documentation with examples
  - Included embedded events response structure examples
  - Enhanced meta fields and query parameters documentation

### Changed

- Migrated from Vuetify to Quasar Framework
- Switched to Quasar CLI for project management
- Updated component system to use Quasar's built-in components

### Fixed

- Fixed empty data fields in EventDetails page by expanding API meta fields request
- Fixed coordinate swap issue (lat/lon were reversed in API response transformation)
- Fixed mobile content ordering - quick summary boxes now appear first on mobile across all tabs

### Security

- None yet
