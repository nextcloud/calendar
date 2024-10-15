/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getTimezoneManager } from '@nextcloud/timezones'

const timezoneManager = getTimezoneManager()
let initialized = false

/**
 * Gets the timezone-manager
 * initializes it if necessary
 *
 * @return {TimezoneManager}
 */
export default function() {
	if (!initialized) {
		timezoneManager.registerDefaultTimezones()

		initialized = true
	}

	return timezoneManager
}
