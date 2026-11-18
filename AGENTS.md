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

### Code comments

The diff shows *what* changed and *how*; a comment exists only to capture *why* — intent the code and names can't convey on their own.

- **Default to none.** Most changes need zero comments; express intent through clear names and small functions.
- **Comment the *why*, never the *how*.** Legitimate reasons: a non-obvious workaround (link the issue/ticket), a subtle business rule, a deliberate deviation from the expected. Never narrate what the next lines do.
- **No multi-line explanatory blocks, AI-style walkthroughs, or section banners.**
- **Remove a stale comment** only when you're already editing that code for the task at hand — no drive-by cleanups.

## Coding conventions

These are the points maintainers raise again and again in review. Following them up
front keeps review focused on design instead of the same recurring notes.

### Scope & commits
- **One concern per PR.** Keep unrelated edits, drive-by refactors, code-style churn,
  dependency/lock-file bumps and new runtime-version support out of a feature PR — put
  them in a separate PR so they stay backportable to stable branches. Small,
  single-purpose PRs sail through; large diffs draw change requests.
- **The commit type must match the change:** moving code with no behavior change is
  `refactor:`, not `feat:`. Scopes stay broad (`editor`, `ui`).
- **Reuse before reinventing.** Grep for an existing helper, mapper, constant or pattern
  and mirror it instead of writing a parallel implementation.

### PHP backend
- **Types over PHPDoc.** Prefer native param/return/property types; drop PHPDoc that only
  restates them; keep `@throws` and anything that adds information. Use precise
  `psalm-type` array shapes (reuse existing shape definitions) instead of bare `array`.
  Handle Psalm's possible-null and
  `string|false` (e.g. `file_get_contents`) results — throw a `ServiceException`, don't
  cast the failure away. Use constructor property promotion and strict comparison
  (`===`, `in_array(..., true)`).
- **Exceptions.** Catch narrowly — never a blanket `\Exception`/`\Throwable` for a
  specific failure. When wrapping, pass the original as `$previous` (or rethrow) so the
  stack trace survives. Throw domain exceptions; don't leak abstraction-layer exceptions
  (`DoesNotExistException`, storage exceptions) out of a service. Keep `@throws` in sync
  with the interface contract.
- **Logging.** Inject `LoggerInterface`; log with a meaningful message and
  `['exception' => $e]` context at the right level. Log non-critical conditions at
  info/debug and return rather than throwing or spamming warnings. Never swallow errors.
- **Dependency injection & layering.** Inject collaborators (incl. OCP services) via the
  constructor, not the service locator. Replace `time()` with `ITimeFactory` for
  testability. Don't inject request data such as `userId` into services (controllers
  only) — pass it as an argument so the service stays usable from background jobs. Keep
  controllers thin (request/response only); business logic and DB access belong in
  services; keep constants in their owning class.
- **Nextcloud API boundaries.** Never use another app's private `\OCA\OtherApp\*` API — go
  through a stable OCP interface. Respect the minimum server version in `appinfo/info.xml`;
  guard newer OCP APIs with `method_exists` + a fallback. Store new config via
  `IAppConfig` (no dots in new keys). Controllers use `#[NoAdminRequired]` for non-admin
  routes (omit it on admin-only ones), HTTP 422 for validation errors and `Http::STATUS_*`
  constants. Keep 400 (client error) vs 404 (not found) intentional. Prefer kebab-case
  URLs with the id in the path and a single `resource` route.
- **Controller access control.** Check that the current user owns the resource before
  acting on an incoming id — guard against IDOR, don't act on a guessed id. Take a nullable
  `?string $userId` from the predefined core services and return 401 when it is null.

### Mappers & entities
- **Build every query with `IQueryBuilder`, never with raw SQL strings.** Use `expr()` for
  conditions, `func()` for SQL functions and `createNamedParameter()` for values — the
  builder handles quoting, table prefixes and dialect differences (Oracle, Postgres,
  SQLite). Don't pass hand-written SQL to `IDBConnection`, and don't concatenate
  keywords, operators or fragments into `createFunction()`. The one accepted use of
  `createFunction()` is embedding a builder-generated subquery:
  `$qb->expr()->in('col', $qb->createFunction($sub->getSQL()))`.
- Let mappers propagate `DoesNotExistException` / `OCP\DB\Exception` to the caller — don't
  catch not-found inside the mapper. Reuse the `QBMapper` `insert`/`update`/`find` helpers
  instead of hand-writing queries.
- Name accessors `findX`/`getX` (not `store`); keep entity `@method` annotations accurate,
  including `int|null` for nullable columns; register column types with `addType` in the
  constructor.

### Database & migrations
- **Re-runnable:** check column/table existence before changing schema so a partially
  failed migration can retry.
- **Version naming:** name the `Version` class after the *next unreleased* minor and bump
  `version` in `appinfo/info.xml`, or the migration won't run.
- **Foreign keys** on referencing columns, with the delete action chosen from the
  relationship: cascade delete for rows the parent owns (so deleting the parent leaves
  no orphans), `SET NULL` for an optional reference, `RESTRICT` to prevent deletion. Clean up
  dangling rows pre-schema.
- **Indexes:** composite column order matters (`[a,b]` ≠ `[b,a]`) — match the query's
  WHERE/ORDER BY; add covering indexes on exactly the filtered/joined columns; make the
  index unique when the column is.
- **Portability & size:** sensible column lengths (avoid MariaDB off-row storage), truncate
  before writing fixed-width columns, Oracle needs nullable booleans and treats empty
  strings as `NULL`, Postgres/Oracle are strict about VARCHAR-vs-INT. Batch huge
  UPDATE/DELETE and emit progress. Inline entity constants in migrations (a loaded class
  can hold stale values mid-upgrade).

### Performance
- Push filters/limits/cursors into the DB query; scope by `user_id`; use `WHERE ... IN`
  to avoid N+1; don't `array_merge` in a loop. Stream large result sets via generators
  and guard against OOM — users can have many calendars with thousands of events. Prefer a local cache over a
  distributed one for recomputable values and scope cache keys per user.

### Frontend (Vue / JS)
- **Async:** `async`/`await` with `try`/`catch`, never mixed with `.then`; never `await`
  inside `forEach` (use `for...of`); a missing `await` is a real bug. Await sequential
  per-item dispatches instead of flooding the backend, and don't fire one request per
  list item — push it to the backend or preload via initial state.
- **Structure:** HTTP and CalDAV handling in the service layer, mutations inside store
  actions, business logic out of components. Add a loading/disabled state to any control
  that triggers an async action so a double click can't fire it twice. Don't make an
  element look clickable when its action is unavailable.
- **Style of code:** early returns over nested conditions, named constants over magic
  numbers, `const`/`let` never `var`, pure helpers free of side effects and store access.
  Sanitize user-controlled values before they reach the DOM. Use `isDarkTheme` from
  `@nextcloud/vue`, not `window.matchMedia('(prefers-color-scheme: dark)')`. Follow the
  dev-manual naming the linter can't check: multi-word PascalCase component names
  (`SettingsView`, not `Settings`), prefixed sub-components, and acronyms with only the
  first letter capitalised (`callHttpApi`).
- **CSS:** see [Styling](#styling); keep styles scoped, follow BEM, prefer a modifier class
  over manipulating inline style, use grid/spacing/breakpoint CSS variables (no hard-coded
  breakpoints), and remove now-unused styles. Avoid `::v-deep`/`!important` into upstream
  component internals; where a deep selector is genuinely needed, comment why so it isn't
  dropped by mistake.

### Internationalization
- Wrap every user-facing string, **including aria-labels**, in `t('calendar', …)`. Use one
  string with placeholders — never concatenate translated fragments (translators reorder
  words). Use `n('calendar', …)` with a `%n` placeholder for counts. Never compare against a
  hard-coded English string or use a translated string as a key. No HTML inside a
  translation string — translate the plain parts and HTML-encode the inserts.

### Accessibility
- Real anchor (`<a href … target="_blank">`) for links, not a JS click handler, so screen
  readers and native middle-click work. Use semantically correct elements and let
  `NcButton` inject the required a11y attributes rather than hand-rolling clickable markup.

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

### Ticket readiness

Bug fixes and small changes can go straight to a PR without opening a new ticket; still search for an existing ticket and reference it in the PR (e.g. `Closes #1234`) if there is one. New features and larger changes (touching several subsystems, needing an architectural decision, or without a clear approach yet) need a ticket that is ready to be picked up. Confirm this before starting implementation:
- A ticket still labeled `0. to triage` is **not** ready — it has not been accepted by a maintainer, and the approach (or whether the change is wanted at all) has not been discussed yet. Do not start coding from it.
- Only `1. to develop` (or a later pipeline label) signals the ticket has been triaged and discussed. That discussion must happen **before** the PR is opened, not in review after the fact.
- If no ticket exists, or it is still `0. to triage`, stop and tell the contributor to get it triaged and discussed first rather than starting an agent-driven implementation.
- If a bug fix turns out to need a larger change, stop and treat it as one.

Do NOT commit changes unless explicitly asked to do so.

Never fully automate the resolution of issues labeled [`good first issue`](https://github.com/issues?q=org%3Anextcloud+label%3A%22good+first+issue%22) or similar beginner-friendly labels.

After completing code changes:
1. Verify your work is complete and tests pass. Validate every change to runtime behavior on a live Nextcloud instance where you can, and give the contributor concrete steps to test it there themselves — your testing supports theirs, it does not replace it.
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

### Issues, PR descriptions and comments

Issues, PR descriptions and comments may be drafted with AI and posted on the contributor's behalf when they ask for it. Write them for human readers (see the [AI Contribution Policy](https://github.com/nextcloud/.github/blob/master/AI_POLICY.md)):

- Lead with what changed and why it matters, in plain and concise sentences. Don't restate the diff file by file, add filler, or paste raw tool output.
- Keep the repository's PR or issue template intact and fill in every section, including the AI disclosure checkbox. For a bug report, also state whether the bug was validated and reproduced on a live Nextcloud instance.
- End AI-drafted issues and comments with a footer such as `Assisted by <AgentName>:<model-id>`.
- Put information meant only for agents (plans, prompts, tool logs) into a collapsed `<details>` block.
- Tell the contributor what you posted.

### Commit Message Format

The message body explains **why** the change was made — the problem it solves and the decisions the diff does not show — not how; the diff already shows that. Don't restate the changed lines as a bullet list.

All commits must include two trailers at the end:
1. Agent/model attribution: `Assisted-by: <AgentName>:<model-id>`
2. DCO sign-off: Use `git commit -s` to add automatically

When committing, use: `git commit -m "message" -s`

This ensures the sign-off includes your configured Git user email.

Example:
```
fix(alarms): keep reminders when moving an event to another calendar

Moving an event recreated it in the target calendar without its
VALARM components, so reminders were silently lost. Copy the alarms
along with the event.

Assisted-by: ClaudeCode:claude-sonnet-5-5
Signed-off-by: Name <email>
```

### Official documentation (user_manual / admin_manual)

Admin- and user-facing documentation for this app lives in the separate
[`nextcloud/documentation`](https://github.com/nextcloud/documentation) repository
(`admin_manual/groupware/calendar.rst`, `user_manual/groupware/calendar.rst`) — not in this
repository.

Not every change needs a doc update — a lot of small fixes and internal changes don't
touch anything a user or admin would need explained. But a change substantial enough to
need one (a new integration, a new settings area, a new concept the user has to learn)
should get it written right away, alongside the feature PR, not deferred to "later":
open a draft pull request in `nextcloud/documentation` with the
`admin_manual`/`user_manual` change. Keep it in draft and don't merge it until the
feature PR itself has merged — the feature can still change shape during review, and
docs merged early drift out of sync with what actually ships.

### Styling

For all CSS colors, spacing, and dimensions, you must use the standard Nextcloud CSS variables.

Do not leave any magic numbers. If you need more specific control over dimensions use `calc(x*var)` when necessary.

You can find the CSS variables already in use in this repository, and the full documentation available at this link: https://docs.nextcloud.com/server/latest/developer_manual/html_css_design/css.html.

