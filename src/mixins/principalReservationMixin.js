/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { showWarning } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'

/**
 * Options-API mixin behind the "Reserve" button of a "Show all" list.
 *
 * Reserving emits `addResource` with the principal as a room or resource
 * attendee; `ResourceList` adds it to the event and the reservation is sent
 * when the event is saved. The declared `emits` are up to each component.
 *
 * The consuming component is expected to use `principalAvailabilityMixin`
 * (for `availabilityFor()`).
 */
export default {
	props: {
		/**
		 * Email addresses of the rooms and resources that are already attendees of the event
		 */
		alreadyInvitedEmails: {
			type: Array,
			default: () => [],
		},
	},

	methods: {
		/**
		 * Whether the principal is already an attendee of the event.
		 *
		 * @param {object} principal The room or resource principal
		 * @return {boolean}
		 */
		isReserved(principal) {
			return this.alreadyInvitedEmails.includes(principal.emailAddress)
		},

		/**
		 * Whether the principal can be reserved: it needs an email address and must
		 * not be reserved yet. Being busy does not prevent it; `reserve()` warns.
		 *
		 * @param {object} principal The room or resource principal
		 * @return {boolean}
		 */
		canReserve(principal) {
			return !!principal.emailAddress
				&& !this.isReserved(principal)
		},

		/**
		 * Reserve the principal by adding it to the event as a room or resource attendee,
		 * with a warning when it is already booked during the event.
		 *
		 * @param {object} principal The room or resource principal
		 */
		reserve(principal) {
			if (this.availabilityFor(principal) === false) {
				showWarning(t('calendar', '{name} is already booked at this time', {
					name: principal.displayname ?? principal.emailAddress,
				}))
			}

			this.$emit('addResource', {
				commonName: principal.displayname,
				email: principal.emailAddress,
				calendarUserType: principal.calendarUserType,
				roomAddress: principal.dav?.roomAddress,
			})
		},
	},
}
