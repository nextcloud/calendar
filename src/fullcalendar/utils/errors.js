/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from '@/utils/logger.js'

/**
 * Wraps a FullCalendar hook function with error logging
 *
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} hookFn The hook function to wrap
 * @param {string} hookName The name of the hook for logging
 * @param {ReturnType<T>} [defaultReturn] The default return value if the hook throws an error
 * @return {T} The wrapped hook function
 */
export function errorCatch(hookFn, hookName, defaultReturn = undefined) {
	return function(...args) {
		try {
			return hookFn.apply(this, args)
		} catch (error) {
			logger.error(`Calendar Hook Error in ${hookName}:`, { error, args })
			return defaultReturn
		}
	}
}

/**
 * Wraps an async FullCalendar hook function with error logging
 *
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} hookFn The async hook function to wrap
 * @param {string} hookName The name of the hook for logging
 * @return {(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>|undefined>} The wrapped async hook function
 */
export function errorCatchAsync(hookFn, hookName) {
	return async function(...args) {
		try {
			return await hookFn.apply(this, args)
		} catch (error) {
			logger.error(`Calendar Hook Error in ${hookName}:`, { error, args })
		}
	}
}
