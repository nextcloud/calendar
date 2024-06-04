/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { urldecode } from '../../../../src/utils/url'

describe('utils/url test suite', () => {
	it('should decode urls encoded by php', () => {
		const testData = [
			['my+group+%2B%26%3F%25', 'my group +&?%'],
			['my%2520+group', 'my%20 group'],
			['group%20with%20spaces', 'group with spaces'],
		]

		for (const [encoded, expected] of testData) {
			const decoded = urldecode(encoded)
			expect(decoded).toEqual(expected)
		}
	})
})
