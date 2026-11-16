/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Runs in the browser, injected with `page.addInitScript` before the scripts of the page.
// Bundled in memory, see `addEventEditorExtensionApiScript`.
//
// Exposes `registerEventEditorExtension` so that tests can register their own extensions on the page,
// e.g. with `page.evaluate`, instead of loading them from the server.
// Registering through this copy of `@nextcloud/calendar` works,
// as all copies on the page share the registry in a global variable.

import { registerEventEditorExtension } from '@nextcloud/calendar'

window.registerEventEditorExtension = registerEventEditorExtension
