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
 * @param version The major version number to compare against
 * @return True if supported
 */
export function isAfterVersion(version: number): boolean {
	return getNextcloudVersion() >= version
}

/**
 * Whether the current Nextcloud version is equal or higher than the given major.minor.patch version
 *
 * @param major The major version number to compare against
 * @param minor The minor version number to compare against
 * @param patch The patch version number to compare against
 * @return True if supported
 */
export function isAtLeastVersion(major: number, minor = 0, patch = 0): boolean {
	const current = OC.config.version.split('.').map((part) => parseInt(part) || 0)
	const required = [major, minor, patch]
	for (let i = 0; i < required.length; i++) {
		const part = current[i] ?? 0
		if (part !== required[i]) {
			return part > required[i]
		}
	}
	return true
}
