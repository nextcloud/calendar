/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditorExtension } from '@nextcloud/calendar'

import logger from '@/utils/logger.js'

/**
 * Call a callback of an extension, logging instead of throwing its errors,
 * so that a broken extension does not break the editor.
 *
 * @param extension - The extension the callback belongs to
 * @param name - Name of the callback for the log
 * @param callback - The callback to call
 */
export function callSafely(extension: IEventEditorExtension, name: string, callback: () => void | Promise<void>): void {
	const logError = (error: unknown) => {
		logger.error(`Event editor extension \`${extension.name}\` of app \`${extension.app}\` failed in \`${name}\``, { error })
	}
	try {
		const result = callback()
		if (result instanceof Promise) {
			result.catch(logError)
		}
	} catch (error) {
		logError(error)
	}
}
