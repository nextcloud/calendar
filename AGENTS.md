<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# AGENTS.md

This file provides guidance to AI coding assistants working with code in this repository.

## Commands

### Setup
```bash
composer i
npm ci
```

### JavaScript
See `package.json` scripts for all available commands (build, dev, watch, lint, stylelint, test:unit, test:e2e, etc.).

### PHP
Available composer commands:
```bash
composer cs:check                # Check code style
composer cs:fix                  # Fix code style
composer psalm                   # Run static analysis
composer test:unit               # Run unit tests
composer test:integration        # Run integration tests
```
See `composer.json` for all available commands.

## Architecture

### Stack
- **Backend**: PHP (see `appinfo/info.xml` for version requirements), Nextcloud app framework, CalDAV protocol support. Namespace: `OCA\Calendar\`.
- **Frontend**: Vue 3, Pinia, Vue Router 5, FullCalendar 6, bundled with rspack.

### PHP Backend (`lib/`)
Layered: Controllers → Services → DB Mappers.

- **`Controller/`** — Thin HTTP handlers; business logic lives in services.
- **`Service/`** — Core logic. Key areas: calendar management, event handling, attendee management, reminders/alarms, availability/free-busy, appointment booking integrations, CalDAV synchronization.
- **`Db/`** — Nextcloud `QBMapper`-based mappers and entity models.
- **`BackgroundJob/`** — Nextcloud background jobs for maintenance tasks (e.g., cleaning up outdated bookings).
- **`Listener/`** — Event listeners hooked to domain events from `lib/Events/`.
- **`Dashboard/`** — Widgets for the Nextcloud dashboard.
- **`Http/`** — HTTP client utilities for external calendar sources (WebCal support).
- **`Objects/`** — Domain models for calendar objects (events, availability, etc.).
- **`Migration/`** — Database migrations.

### JavaScript Frontend (`src/`)
Single-page Vue 3 app using FullCalendar for event visualization. Main entry point is `App.vue`.

- **`store/`** — Central Pinia store (calendars, events, user preferences).
- **`services/`** — JS services that call the PHP REST API.
- **`components/`** — Vue components (event creation, event detail view, calendar sidebar, settings, etc.).
- **`router.js`** — Routes for main calendar view and other views.
- **`views/`** — Top-level page views.

### Frontend Conventions

- **New components** must use the **Vue Composition API** with `<script setup lang="ts">`. Do not use the Options API for new components.
- **New stores** (Pinia) must be written in **TypeScript** using the composition-style `defineStore` with `setup()`.
- **New services** and any other new frontend modules (utilities, composables, etc.) must be written in **TypeScript** (`.ts` files).
- Existing files written in JavaScript or using the Options API do not need to be migrated unless you are substantially refactoring them.

### Key Conventions
- **Registration**: `appinfo/info.xml` registers background jobs, dashboard widgets, navigation entries, and dependencies. `AppInfo/Application.php` registers event listeners and other services via the Nextcloud bootstrap API.
- **Events**: Domain events in `lib/Events/` are dispatched after state changes; `lib/Listener/` reacts to them.
- **CalDAV**: The app integrates with Nextcloud's CalDAV backend to sync events. Protocol compliance is critical, but CDAV-related work belongs in `cdav-library`, DAV-related work belongs in the `dav` app in `server`, and neither should be added to this repository to keep a clear separation of concerns.
- **REUSE & SPDX**: Every file requires an SPDX license header. **New files must use `AGPL-3.0-or-later`, never `AGPL-3.0-only`**. Header format:
  ```php
  /*
   * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
   * SPDX-License-Identifier: AGPL-3.0-or-later
   */
  ```

## Testing

### Unit Tests
Located in `tests/Unit/` with structure mirroring `lib/`.

#### Pattern
- Use **arrange-act-assert** structure with blank lines separating each phase (no literal comments)
- Mock dependencies via `$this->createMock(Interface::class)`
- Setup mocks in `setUp()` for common fixtures

#### Running Tests
```bash
composer test:unit                                    # Run all unit tests
composer test:unit -- tests/Unit/Service/HtmlTest.php # Run specific test file
composer test:unit -- --filter="TestClassName"        # Run tests matching filter
```

### Integration Tests
Located in `tests/Integration/`.

#### Running Tests
```bash
composer test:integration                                           # Run all integration tests
composer test:integration -- tests/Integration/IMAP/MessageMapperTest.php # Run specific test file
composer test:integration -- --filter="TestClassName"               # Run tests matching filter
composer test:integration:dev                                       # Run and stop on first failure
```

## Git Workflow

Do NOT commit changes unless explicitly asked to do so.

After completing code changes:
1. Verify your work is complete and tests pass
2. Never push directly to `main` — always create a feature branch with a descriptive name (e.g. `perf/imap-selective-headers`, `fix/sync-token`, `chore/update-agents`).
3. Worktree branches must use descriptive feature-branch names, not generated names like `agent-xxxx`.
4. Make sure there is no trailing whitespace
5. Leave changes in working directory or staged (do not commit)
6. Provide a summary of what was changed and why
7. Suggest a commit message using Conventional Commits format
8. The user will review and commit when ready

### PR Review Workflow

Once a branch is pushed and under review, **do not force-push**. Reviewers track changes incrementally — a force-push destroys that history and forces them to re-read the full diff from scratch.

Instead, address feedback with **fixup commits**:
```bash
git commit --fixup=<sha>   # targets the specific commit being corrected
```

The branch will be rebased and squashed into a clean history before merge (CI enforces this). The failing "clean history" CI check is intentional and expected during review — ignore it until the PR has a positive review, then rebase to clean up.

### Commit Message Format

All commits must include two trailers at the end:
1. Agent/model attribution: `Assisted-by: <AgentName>:<model-id>`
2. DCO sign-off: Use `git commit -s` to add automatically

When committing, use: `git commit -m "message" -s`

This ensures the sign-off includes your configured Git user email.

Example:
```
fix(deps): update package dependencies

- update package X to latest stable version
- verify all tests pass

Assisted-by: Claude:claude-sonnet-4-6
Signed-off-by: Name <email>
```

### Styling

For all CSS colors, spacing, and dimensions, you must use the standard Nextcloud CSS variables.

Do not leave any magic numbers. If you need more specific control over dimensions use `calc(x*var)` when necessary.

You can find the CSS variables already in use in this repository, and the full documentation available at this link: https://docs.nextcloud.com/server/latest/developer_manual/html_css_design/css.html.

