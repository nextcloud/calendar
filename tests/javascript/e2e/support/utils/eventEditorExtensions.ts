/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { registerEventEditorExtension } from '@nextcloud/calendar-integration'
import type { Page } from '@playwright/test'

import path from 'node:path'
import { build } from 'rolldown'

declare global {
	interface Window {
		/** Exposed by `addEventEditorExtensionApiScript` */
		registerEventEditorExtension: typeof registerEventEditorExtension
	}
}

/**
 * Header the E2E test app needs to load its own extension (see BeforeEventEditorLoadedListener::TESTS_HEADER),
 * so that other tests can register their own extensions in isolation.
 */
export const EVENT_EDITOR_EXTENSION_TEST_APP_HEADER = 'X-Running-Event-Editor-Extension-App-Tests'

let eventEditorExtensionApiScript: Promise<string> | undefined

/**
 * Expose `window.registerEventEditorExtension` on every document the page loads afterwards,
 * so that tests can register their own extensions, e.g. in `page.evaluate`.
 * Call it before navigating, as it is added with an init script running before the scripts of each page.
 *
 * Init scripts cannot be modules, so the source of the script is bundled with its imports
 * into a single classic script, in memory and once per worker.
 *
 * @param page The page to register extensions on
 */
export async function addEventEditorExtensionApiScript(page: Page): Promise<void> {
	eventEditorExtensionApiScript ??= build({
		input: path.resolve(__dirname, '../browser/eventEditorExtensionApi.ts'),
		platform: 'browser',
		write: false,
		output: {
			format: 'iife',
		},
	}).then(({ output }) => output[0].code)
	await page.addInitScript({ content: await eventEditorExtensionApiScript })
}
