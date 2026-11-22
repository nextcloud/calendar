/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import InviteesList from '@/components/Editor/Invitees/InviteesList.vue'

describe('components/Editor/Invitees/InviteesList', () => {
	const delegatorUrl = '/remote.php/dav/principals/users/delegator/'

	it.each([
		['mailto:assistant@example.com', true, true],
		['mailto:delegator@example.com', true, true],
		['mailto:delegator@example.com', false, false],
		['mailto:someone@example.com', true, false],
	])('isOrganizer for organizer %s, delegated calendar %s: %s', (organizerUri, isDelegated, expected) => {
		const vm = {
			calendar: { isDelegated, delegatorUrl },
			calendarObjectInstance: { organizer: { uri: organizerUri } },
			principalsStore: {
				getCurrentUserPrincipal: { emailAddress: 'assistant@example.com' },
				getPrincipalByUrl: (url) => (url === delegatorUrl ? { emailAddress: 'delegator@example.com' } : undefined),
			},
			get delegatorEmailAddress() {
				return InviteesList.computed.delegatorEmailAddress.call(this)
			},
		}

		expect(InviteesList.computed.isOrganizer.call(vm)).toBe(expected)
	})
})
