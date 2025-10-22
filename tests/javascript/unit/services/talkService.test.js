/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { extractCallTokenFromUrl, generateURLForToken } from '../../../../src/services/talkService'

describe('services/talk test suite', () => {
	let windowSpy

	beforeEach(() => {
		windowSpy = vi.spyOn(window, 'window', 'get')
	})

	afterEach(() => {
		windowSpy.mockRestore()
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
		expect(extractCallTokenFromUrl(url)).toBe(expected)
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
		windowSpy.mockImplementation(() => ({
			location,
			_oc_webroot: '/nextcloud',
		}))
		expect(generateURLForToken('foobar')).toBe(expected)
	})
})
