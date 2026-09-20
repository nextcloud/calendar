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

vi.mock('@/services/autocompleteService', () => ({
	autocomplete: vi.fn(),
}))

vi.mock('@/utils/logger.js', () => ({
	default: {
		debug: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
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

const ocsResponse = (data) => ({
	data: {
		ocs: {
			meta: { status: 'ok' },
			data,
		},
	},
})

function mockTalkRoom(room) {
	axios.get.mockImplementation((url) => {
		if (url.endsWith('/participants')) {
			return Promise.resolve(ocsResponse([{
				actorId: 'organizer',
				participantType: 1,
			}]))
		}
		return Promise.resolve(ocsResponse(room))
	})
	axios.post.mockResolvedValue(ocsResponse({ type: room.type }))
}

function eventWithAttendee(email, commonName = undefined) {
	return {
		getConferenceList: () => [{ uri: `${window.location.origin}/call/foobar` }],
		location: '',
		getAttendeeIterator: () => [{
			email: `mailto:${email}`,
			commonName,
			userType: 'INDIVIDUAL',
		}],
	}
}

describe('services/talk test suite', () => {
	beforeEach(() => {
		getCurrentUser.mockReturnValue({ uid: 'organizer' })
	})

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

	it('does not invite an external attendee to a Calendar-owned conversation', async () => {
		mockTalkRoom({ type: 3, objectType: 'event' })
		autocomplete.mockResolvedValue([])

		await updateRoomParticipantsFromEvent(eventWithAttendee('external@example.com'))

		expect(axios.post).not.toHaveBeenCalled()
	})

	it('still adds a Nextcloud user to a Calendar-owned conversation', async () => {
		mockTalkRoom({ type: 3, objectType: 'event' })
		autocomplete.mockResolvedValue([{
			id: 'internal-user',
			shareWithDisplayNameUnique: 'internal@example.com',
		}])

		await updateRoomParticipantsFromEvent(eventWithAttendee('internal@example.com'))

		expect(axios.post).toHaveBeenCalledOnce()
		expect(axios.post).toHaveBeenCalledWith(
			expect.stringMatching(/\/room\/foobar\/participants$/),
			{
				newParticipant: 'internal-user',
				source: 'users',
			},
			expect.any(Object),
		)
	})

	it('preserves email invitations for non-event public conversations', async () => {
		mockTalkRoom({ type: 3, objectType: '' })
		autocomplete.mockResolvedValue([])

		await updateRoomParticipantsFromEvent(eventWithAttendee('external@example.com'))

		expect(axios.post).toHaveBeenCalledOnce()
		expect(axios.post).toHaveBeenCalledWith(
			expect.stringMatching(/\/room\/foobar\/participants$/),
			{
				newParticipant: 'external@example.com',
				source: 'emails',
			},
			expect.any(Object),
		)
	})

	it('does not fall back to an email invitation when lookup fails for an event conversation', async () => {
		mockTalkRoom({ type: 3, objectType: 'event' })
		autocomplete.mockRejectedValue(new Error('Lookup failed'))

		await updateRoomParticipantsFromEvent(eventWithAttendee('external@example.com'))

		expect(axios.post).not.toHaveBeenCalled()
	})
})
