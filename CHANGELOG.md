# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2024-01-15

### Security
- **CRITICAL:** Updated `multer` from 1.4.5-lts.1 to 2.0.2 to fix multiple DoS vulnerabilities:
  - Fixed DoS via unhandled exception from malformed requests (CVE)
  - Fixed DoS via unhandled exceptions (CVE)
  - Fixed DoS from maliciously crafted requests (CVE)
  - Fixed DoS via memory leaks from unclosed streams (CVE)

### Added
- Enhanced upload error handling with specific error messages
- Added limits for files, fields, and parts in multer configuration
- Added multer-specific error handling middleware in upload routes

### Changed
- Improved file upload security with stricter limits
- Better error messages for upload failures

## [1.0.0] - 2024-01-15

### Added
- Initial release
- Complete backend with REST API and WebSocket support
- React Native frontend with Expo
- MongoDB database integration
- JWT authentication with OTP
- Real-time messaging
- File upload support
- Push notifications
- Dark/light mode
- Comprehensive documentation
