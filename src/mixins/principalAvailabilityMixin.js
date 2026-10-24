/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { checkResourceAvailability } from '../services/freeBusyService.js'
import logger from '../utils/logger.js'

export default {
	data() {
		return {
			availabilityById: {},
		}
	},

	methods: {
		/**
		 * Request the free/busy state of the given principals for the event's time span.
		 *
		 * @param {object[]} principals The room or resource principals
		 * @return {Promise<void>}
		 */
		async loadAvailability(principals) {
			const organizerEmail = this.principalsStore.getCurrentUserPrincipalEmail
			const start = this.calendarObjectInstance?.eventComponent?.startDate
			const end = this.calendarObjectInstance?.eventComponent?.endDate

			const options = principals
				.filter((principal) => !!principal.emailAddress)
				.map((principal) => ({ id: principal.id, email: principal.emailAddress, isAvailable: true }))

			if (!organizerEmail || !start || !end || options.length === 0) {
				return
			}

			try {
				await checkResourceAvailability(options, organizerEmail, start, end)
			} catch (error) {
				logger.error('Could not check availability of principals', { error })
			}

			const availabilityById = {}
			for (const option of options) {
				availabilityById[option.id] = option.isAvailable
			}
			this.availabilityById = availabilityById
		},

		/**
		 * The availability of a principal.
		 *
		 * @param {object} principal The room or resource principal
		 * @return {boolean|null} True if free, false if busy, null when it was not checked
		 */
		availabilityFor(principal) {
			return this.availabilityById[principal.id] ?? null
		},
	},
}
