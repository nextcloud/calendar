/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { generateUrl } from '@nextcloud/router'
import { generateTaskUrl, urldecode } from '@/utils/url'

vi.mock('@nextcloud/router')

describe('utils/url test suite', () => {
	beforeEach(() => {
		vi.mocked(generateUrl).mockClear()
	})

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

	it.each([
		[
			'/remote.php/dav/calendars/admin/calendar_shared_by_User%20NAME/EAFB112A-4556-404A-B807-B1E040D0F7A0.ics',
			'apps/tasks/calendars/calendar_shared_by_User%2520NAME/tasks/EAFB112A-4556-404A-B807-B1E040D0F7A0.ics',
		],
		[
			'/remote.php/dav/calendars/admin/calendar#special/task?file&name.ics',
			'apps/tasks/calendars/calendar%23special/tasks/task%3Ffile%26name.ics',
		],
	])('should generate a task URL from %s', (davUrl, expectedPath) => {
		vi.mocked(generateUrl).mockReturnValueOnce('/generated-url')

		const result = generateTaskUrl(davUrl)

		expect(result).toBe('/generated-url')
		expect(generateUrl).toHaveBeenCalledWith(expectedPath)
	})
})
