/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Wraps a FullCalendar hook function with error logging
 *
 * @param {Function} hookFn The hook function to wrap
 * @param {string} hookName The name of the hook for logging
 * @param {*} [defaultReturn] The default return value if the hook throws an error
 * @return {Function} The wrapped hook function
 */
export function errorCatch(hookFn, hookName, defaultReturn = undefined) {
	return function(...args) {
		try {
			return hookFn.apply(this, args)
		} catch (error) {
			console.error(`Calendar Hook Error in ${hookName}:`, error, ...args)
			return defaultReturn
		}
	}
}

/**
 * Wraps an async FullCalendar hook function with error logging
 *
 * @param {Function} hookFn The async hook function to wrap
 * @param {string} hookName The name of the hook for logging
 * @return {Function} The wrapped async hook function
 */
export function errorCatchAsync(hookFn, hookName) {
	return async function(...args) {
		try {
			return await hookFn.apply(this, args)
		} catch (error) {
			console.error(`Calendar Hook Error in ${hookName}:`, error, ...args)
		}
	}
}
