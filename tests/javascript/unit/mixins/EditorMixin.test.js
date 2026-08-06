/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { loadState } from '@nextcloud/initial-state'
import EditorMixin from '../../../../src/mixins/EditorMixin.js'

vi.mock('@nextcloud/initial-state', () => ({
	loadState: vi.fn(),
}))

/**
 * Evaluate the canAddGuests computed against a stubbed component.
 *
 * @param {object} context Overrides for the computed properties it depends on
 * @return {boolean}
 */
function canAddGuests(context = {}) {
	const self = {
		isViewedByAttendee: true,
		isViewedByOrganizer: false,
		canCreateRecurrenceException: false,
		...context,
		calendarObjectInstance: {
			allowAttendeeGuests: 'TRUE',
			isMasterItem: true,
			...context.calendarObjectInstance,
		},
	}
	self.isAddingGuestsAllowed = EditorMixin.computed.isAddingGuestsAllowed.call(self)

	return EditorMixin.computed.canAddGuests.call(self)
}

describe('mixins/EditorMixin test suite', () => {
	beforeEach(() => {
		loadState.mockReturnValue({ dav: { attendee_guests: true } })
	})

	it('should allow an attendee to add a guest', () => {
		expect(canAddGuests()).toEqual(true)
	})

	it('should not allow adding guests when the organizer turned it off', () => {
		expect(canAddGuests({
			calendarObjectInstance: { allowAttendeeGuests: 'FALSE' },
		})).toEqual(false)
	})

	it('should not allow adding guests when the organizer never turned it on', () => {
		// Which is also the case for every invitation from a remote organizer
		expect(canAddGuests({
			calendarObjectInstance: { allowAttendeeGuests: undefined },
		})).toEqual(false)
	})

	it('should not allow adding guests for a user who is not an attendee', () => {
		expect(canAddGuests({
			isViewedByAttendee: false,
		})).toEqual(false)
	})

	it('should not allow adding guests for an organizer attending their own event', () => {
		expect(canAddGuests({
			isViewedByOrganizer: true,
		})).toEqual(false)
	})

	it('should not allow adding guests to a recurring event', () => {
		expect(canAddGuests({
			canCreateRecurrenceException: true,
		})).toEqual(false)
	})

	it('should not allow adding guests to a recurrence exception', () => {
		// An exception cannot create another one, so canCreateRecurrenceException
		// alone does not catch it
		expect(canAddGuests({
			calendarObjectInstance: { isMasterItem: false },
		})).toEqual(false)
	})

	it('should not allow adding guests when the server does not support it', () => {
		loadState.mockReturnValue({ dav: {} })

		expect(canAddGuests()).toEqual(false)
	})

	it('should not allow adding guests when no capabilities are available', () => {
		loadState.mockReturnValue({})

		expect(canAddGuests()).toEqual(false)
	})
})
