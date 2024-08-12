/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { extractCallTokenFromUrl } from '../../../../src/services/talkService'

describe('services/talk test suite', () => {
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
})
