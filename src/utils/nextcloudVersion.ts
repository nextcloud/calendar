/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Get the current Nextcloud major version
 *
 * @return The major version number
 */
export function getNextcloudVersion(): number {
	return parseInt(OC.config.version.split('.')[0])
}

/**
 * Whether the current Nextcloud version is equal or higher than the given version
 *
 * @return True if supported
 */
export function isAfterVersion(version: number): boolean {
	return getNextcloudVersion() >= version
}
