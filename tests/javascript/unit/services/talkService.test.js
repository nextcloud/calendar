/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCurrentUser } from '@nextcloud/auth'
import axios from '@nextcloud/axios'
import { getBaseUrl } from '@nextcloud/router'
import { autocomplete } from '@/services/autocompleteService'
import { extractRoomUrlToken, generateRoomUrl, updateRoomParticipantsFromEvent } from '@/services/talkService.ts'

vi.mock('@nextcloud/auth', () => ({
	getCurrentUser: vi.fn(),
}))

vi.mock('@nextcloud/axios', () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}))

vi.mock('@nextcloud/initial-state', () => ({
	loadState: vi.fn(() => 'v4'),
}))

vi.mock('@nextcloud/l10n', () => ({
	translate: vi.fn((app, text) => text),
}))

vi.mock('@nextcloud/router', () => ({
	generateUrl: vi.fn((url, params, options) => {
		const baseURL = options?.baseURL || ''
		let path = url
		if (params) {
			Object.keys(params).forEach((key) => {
				path = path.replace(`{${key}}`, params[key])
			})
		}
		// When baseURL is provided, add /index.php prefix (mimics real Nextcloud router behavior)
		return baseURL + (baseURL ? '/index.php' : '') + path
	}),
	generateOcsUrl: vi.fn((url, params) => {
		let path = url
		if (params) {
			Object.keys(params).forEach((key) => {
				path = path.replace(`{${key}}`, params[key])
			})
		}
		return path
	}),
	getBaseUrl: vi.fn(),
}))

vi.mock('@/services/autocompleteService', () => ({
	autocomplete: vi.fn(),
}))

vi.mock('@/utils/logger.js', () => ({
	default: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

describe('services/talk test suite', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	test.each([
		['https://foo.bar/call/123abc456', '123abc456'],
		['https://foo.bar/call/123abc456/', '123abc456'],
		['https://foo.bar/call/123abc456/baz', undefined],
		['https://foo.bar/call/123abc456#', '123abc456'],
		['https://foo.bar/call/123abc456#/', '123abc456'],
		['https://foo.bar/call/123abc456#message_3074226', '123abc456'],
		['https://foo.bar/baz', undefined],
		['https://foo.bar/baz/bar', undefined],
	])('should extract a token from call url %s', (url, expected) => {
		expect(extractRoomUrlToken(url)).toBe(expected)
	})

	test.each([
		[
			{ protocol: 'https:', host: 'nextcloud.testing' },
			'https://nextcloud.testing/nextcloud/index.php/call/foobar',
		],
		[
			{ protocol: 'http:', host: 'nextcloud.testing' },
			'http://nextcloud.testing/nextcloud/index.php/call/foobar',
		],
		[
			{ protocol: 'https:', host: 'nextcloud.testing:8443' },
			'https://nextcloud.testing:8443/nextcloud/index.php/call/foobar',
		],
		[
			{ protocol: 'http:', host: 'nextcloud.testing:8080' },
			'http://nextcloud.testing:8080/nextcloud/index.php/call/foobar',
		],
	])('should generate an absolute URL to a call', (location, expected) => {
		const baseUrl = location.protocol + '//' + location.host + '/nextcloud'
		getBaseUrl.mockReturnValue(baseUrl)

		expect(generateRoomUrl('foobar')).toBe(expected)
	})

	describe('updateRoomParticipantsFromEvent', () => {
		const userA = {
			id: 'jane.doe@example.com',
			label: 'Jane Doe',
			icon: '',
			source: 'users',
			shareWithDisplayNameUnique: 'jane.doe@example.com',
		}

		/**
		 * Mock a private Talk room sync for attendee jane.doe@example.com
		 * alongside another user whose display name is secondUserLabel
		 *
		 * @param {string} secondUserLabel Display name of the other user
		 * @return {object} Event component with the attendee to sync
		 */
		function setupSync(secondUserLabel) {
			const userB = {
				id: 'jane.doe@example.de',
				label: secondUserLabel,
				icon: '',
				source: 'users',
				shareWithDisplayNameUnique: 'jane.doe@example.de',
			}
			const allUsers = [userA, userB]

			getCurrentUser.mockReturnValue({ uid: 'organizer' })
			// Simulate the server autocomplete: a search matches every user
			// whose display name contains it, plus an exact email/uid match
			autocomplete.mockImplementation(async ({ search }) => allUsers.filter((entry) => entry.label.includes(search) || entry.shareWithDisplayNameUnique === search))
			axios.get.mockImplementation(async (url) => {
				const data = url.includes('/participants')
					? [{ actorId: 'organizer', actorType: 'users', participantType: 1, attendeeId: 1 }]
					: { type: 2, token: 'token123' }
				return { data: { ocs: { meta: { status: 'ok' }, data } } }
			})
			axios.post.mockResolvedValue({ data: { ocs: { meta: { status: 'ok' }, data: {} } } })

			return {
				getConferenceList: () => [{ uri: `${window.location.protocol}//${window.location.host}/call/token123` }],
				location: '',
				getAttendeeIterator: function* () {
					yield { userType: 'INDIVIDUAL', email: 'mailto:jane.doe@example.com', commonName: 'Jane Doe' }
				},
			}
		}

		test.each([
			['Jane Doe'],
			['Jane Doe (Test)'],
		])('should add the attendee identified by email when another user is named %s', async (secondUserLabel) => {
			const eventComponent = setupSync(secondUserLabel)

			await updateRoomParticipantsFromEvent(eventComponent)

			expect(axios.post).toHaveBeenCalledWith(
				expect.stringContaining('room/token123/participants'),
				{ newParticipant: 'jane.doe@example.com', source: 'users' },
				expect.any(Object),
			)
			expect(axios.post).not.toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({ newParticipant: 'jane.doe@example.de' }),
				expect.any(Object),
			)
		})

		test('should not resolve the attendee when two users share the same email', async () => {
			const eventComponent = setupSync('Jane Doe')
			// A second user with a different uid but the same email address
			autocomplete.mockImplementation(async () => [
				userA,
				{ ...userA, id: 'jane.doe2' },
			])

			await updateRoomParticipantsFromEvent(eventComponent)

			expect(axios.post).not.toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({ source: 'users' }),
				expect.any(Object),
			)
		})
	})
})
