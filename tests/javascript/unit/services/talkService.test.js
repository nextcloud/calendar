/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { extractRoomUrlToken, generateRoomUrl } from '../../../../src/services/talkService'
import { getBaseUrl } from '@nextcloud/router'

vi.mock('@nextcloud/router', () => ({
	generateUrl: vi.fn((url, params, options) => {
		const baseURL = options?.baseURL || ''
		let path = url
		if (params) {
			Object.keys(params).forEach(key => {
				path = path.replace(`{${key}}`, params[key])
			})
		}
		// When baseURL is provided, add /index.php prefix (mimics real Nextcloud router behavior)
		return baseURL + (baseURL ? '/index.php' : '') + path
	}),
	getBaseUrl: vi.fn(),
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
			'https://nextcloud.testing/nextcloud/index.php/call/foobar'
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
})
