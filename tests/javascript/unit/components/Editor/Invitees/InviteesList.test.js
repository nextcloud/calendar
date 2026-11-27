/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import InviteesList from '@/components/Editor/Invitees/InviteesList.vue'

describe('components/Editor/Invitees/InviteesList', () => {
	const delegatorUrl = '/remote.php/dav/principals/users/delegator/'

	it.each([
		['mailto:assistant@example.com', true, 'assistant@example.com', true],
		['mailto:delegator@example.com', true, 'assistant@example.com', true],
		['mailto:delegator@example.com', true, null, true],
		['mailto:delegator@example.com', false, 'assistant@example.com', false],
		['mailto:someone@example.com', true, 'assistant@example.com', false],
	])('isOrganizer for organizer %s, delegated calendar %s, principal email %s: %s', (organizerUri, isDelegated, principalEmail, expected) => {
		const vm = {
			calendar: { isDelegated, delegatorUrl },
			calendarObjectInstance: { organizer: { uri: organizerUri } },
			principalsStore: {
				getCurrentUserPrincipalEmail: principalEmail,
				getPrincipalByUrl: (url) => (url === delegatorUrl ? { emailAddress: 'delegator@example.com' } : undefined),
			},
			get delegatorEmailAddress() {
				return InviteesList.computed.delegatorEmailAddress.call(this)
			},
		}

		expect(InviteesList.computed.isOrganizer.call(vm)).toBe(expected)
	})
})
