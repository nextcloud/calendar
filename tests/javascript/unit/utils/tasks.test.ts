/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { generateUrl } from '@nextcloud/router'
import { generateTaskUrl, parseTaskDavUrl } from '@/utils/tasks'

vi.mock('@nextcloud/router')

describe('utils/tasks test suite', () => {
	beforeEach(() => {
		vi.mocked(generateUrl).mockClear()
	})

	it.each([
		[
			'/remote.php/dav/calendars/admin/calendar_shared_by_User%20NAME/EAFB112A-4556-404A-B807-B1E040D0F7A0.ics',
			'calendar_shared_by_User%20NAME',
			'EAFB112A-4556-404A-B807-B1E040D0F7A0.ics',
		],
		[
			'/remote.php/dav/calendars/admin/calendar#special/task?file&name.ics',
			'calendar#special',
			'task?file&name.ics',
		],
	])('should parse task IDs from %s', (davUrl, calendarId, taskId) => {
		expect(parseTaskDavUrl(davUrl)).toEqual({ calendarId, taskId })
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
