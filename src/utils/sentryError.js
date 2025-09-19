/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Intercept errors to enrich them with data for Sentry.
 *
 * @param {Array} args Constructor arguments
 */
export default function Error(...args) {
	const error = new window.Error(...args)
	window.Sentry?.setTag('captured_by', 'sentryError.js')
	window.Sentry?.setExtras({
		args,
		error,
	})
	return error
}
