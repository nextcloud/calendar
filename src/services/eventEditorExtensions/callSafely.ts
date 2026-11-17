/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtension } from '@nextcloud/calendar'

import logger from '@/utils/logger.js'

/**
 * Call a callback of an extension, logging instead of throwing its errors,
 * so that a broken extension does not break the editor.
 *
 * @param extension - The extension the callback belongs to
 * @param name - Name of the callback for the log
 * @param callback - The callback to call
 */
export function callSafely(extension: EventEditorExtension, name: string, callback: () => void): void {
	try {
		callback()
	} catch (error) {
		logger.error(`Event editor extension \`${extension.name}\` of app \`${extension.app}\` failed in \`${name}\``, { error })
	}
}
