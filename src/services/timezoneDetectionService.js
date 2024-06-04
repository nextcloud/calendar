/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import jstz from 'jstz'

/**
 * Returns the current timezone of the user
 *
 * @return {string} Current timezone of user
 */
const detectTimezone = () => {
	const determinedTimezone = jstz.determine()
	if (!determinedTimezone) {
		return 'UTC'
	}

	const timezoneName = determinedTimezone.name()
	if (!timezoneName) {
		return 'UTC'
	}

	return timezoneName
}

export default detectTimezone
export {
	detectTimezone,
}
