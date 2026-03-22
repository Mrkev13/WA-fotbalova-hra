# Changelog

All notable changes to this project will be documented in this file.

## [2026-03-22]

### Added
- Health check endpoint for zero-downtime deployment (Mrkev13)
- Global error handling middleware with logging (Mrkev13)

### Changed
- Use environment variable for database connection (Mrkev13)
- Add peer flag to `pg` dependency and update documentation (Mrkev13)

### Fixed
- Technical incidents resolved and schema consistency restored (MonsterMarian)

### Removed
- Hidden sabotage report from submission (MonsterMarian)


## [2026-03-21]

### Added
- Build scripts for JS and CSS in `package.json` (Wolfis07)
- Middleware for serving minified static files (Wolfis07)

### Changed
- Increased font sizes for `.tb-stat-lbl` (Wolfis07)
- Refactored logo and title styles in CSS (Wolfis07)

### Fixed
- Gzip caching for minified files (Hamudymw77)
- Missing newline at end of `index.html` (Wolfis07)


## [2026-03-20]

### Added
- CSS resets for `h1` and `h2` (Wolfis07)
- Improved HTML structure and accessibility (Wolfis07)


## [2026-03-18]

### Changed
- Project structure and security improvements (Hamudymw77)


## [2026-03-17]

### Changed
- Security audit (MonsterMarian)
- Database refactoring (MonsterMarian)
- Performance optimization (MonsterMarian)


## [2026-03-16]

### Fixed
- Match end handling (Tomago01)
- Button alignment and leaderboard layout (Tomago01)

### Added
- Music, favicon, burger menu (Tomago01)
- Security improvements (Tomago01)


## [2026-03-15]

### Fixed
- CSP `unsafe-inline` issue (Tomago01)

### Changed
- Frontend redesign (Tomago01)
- Security headers added (Tomago01)


## [2026-03-14]

### Fixed
- Topbar logo layout (Hamudymw77)

### Added
- Training market value increase (Hamudymw77)
- Realistic stats and fire refund system (Hamudymw77)


## [2026-03-13]

### Added
- Training, fire system, leveling, match simulation, formation (Hamudymw77)

### Changed
- Refactored styles (logo, stats, notifications) (Wolfis07)
- Improved input validation and error handling (Wolfis07)
- Updated game logic UI (Hamudymw77)

### Fixed
- Login and match events (Hamudymw77)
- Secure player purchase function (MonsterMarian)

### Documentation
- Cleanup of guide and task list (MonsterMarian)
- Added DB fixes report and verification (MonsterMarian)


## [2026-03-12]

### Added
- Pagination (Mrkev13)
- README improvements (Mrkev13)

### Fixed
- Leaderboard and market bot matches (Hamudymw77)


## [2026-03-11]

### Added
- Cloud deployment configuration (Mrkev13)

### Changed
- Database connection updates for Render (Mrkev13)

### Fixed
- Hardcoded external DB connection string (Mrkev13)


## [2026-03-09]

### Added
- Complete backend implementation (Hamudymw77)

### Changed
- Database password update (MonsterMarian)

### Fixed
- Merge conflicts and local password handling (MonsterMarian)


## [2026-03-08]

### Added
- Express server with CORS and API routes (Hamudymw77)
- User registration and login API (Hamudymw77)
- PostgreSQL schema improvements and constraints (MonsterMarian)
- Transaction procedure for secure purchases (MonsterMarian)
- Database features (sessions, queue, indexes, elo, etc.) (MonsterMarian)
- Backend documentation and guides (MonsterMarian)


## [2026-03-06]

### Added
- Initial project structure (MonsterMarian)
- Team plan, economy system, data model (MonsterMarian)


## [2026-03-05]

### Added
- Initial README (MonsterMarian)