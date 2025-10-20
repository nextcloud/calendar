/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import InvitationResponseButtons from '@/components/Editor/InvitationResponseButtons.vue'

describe('components/Editor/InvitationResponseButtons', () => {
	it.each([
		[false, false, null],
		[true, false, 'series'],
		[true, true, 'occurrence'],
	])('determines the response scope', (isRecurring, isException, expected) => {
		const vm = {
			calendarObjectInstanceStore: {
				calendarObjectInstance: {
					eventComponent: {
						isPartOfRecurrenceSet: vi.fn().mockReturnValue(isRecurring),
						isRecurrenceException: vi.fn().mockReturnValue(isException),
					},
				},
			},
		}

		expect(InvitationResponseButtons.computed.responseScope.call(vm)).toBe(expected)
	})

	it.each([
		[null, 'Accept', 'Decline', 'Tentative'],
		['occurrence', 'Accept this occurrence', 'Decline this occurrence', 'Tentative for this occurrence'],
		['series', 'Accept entire series', 'Decline entire series', 'Tentative for entire series'],
	])('labels responses for the selected scope', (responseScope, accept, decline, tentative) => {
		const vm = {
			responseScope,
			t: (app, text) => text,
		}

		expect(InvitationResponseButtons.computed.acceptLabel.call(vm)).toBe(accept)
		expect(InvitationResponseButtons.computed.declineLabel.call(vm)).toBe(decline)
		expect(InvitationResponseButtons.computed.tentativeLabel.call(vm)).toBe(tentative)
	})
})
