/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Calendar, createPlugin } from '@fullcalendar/core'
import listPlugin from '@fullcalendar/list'
import { expect, test, vi } from 'vitest'
import { getDateFormattingConfig } from '@/fullcalendar/localization/dateFormattingConfig.js'
import VTimezoneNamedTimezone from '@/fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'
import getTimezoneManager from '@/services/timezoneDataProviderService.js'
import { getYYYYMMDDFromFirstdayParam } from '@/utils/date.js'
import { getCalendarView } from '@/utils/router.js'

const dateLabels = createPlugin({
	name: 'test-date-label-format',
	cmdFormatter: (_, { start }) => start.marker.toISOString().slice(0, 10),
})

test.each([
	{ firstDay: '2026-12-15', show: 'year', timeZone: 'Pacific/Kiritimati', end: '2027-12-15', includesJanuary: true },
	{ firstDay: 'now', show: 'year', timeZone: 'UTC', end: '2027-12-15', includesJanuary: true },
	{ firstDay: '2026-12-15', timeZone: 'UTC', end: '2027-01-01', includesJanuary: false },
])('listMonth/$firstDay with show=$show in $timeZone fetches and renders the expected range', ({ firstDay, show, timeZone, end, includesJanuary }) => {
	vi.useFakeTimers({ toFake: ['Date'] })
	vi.setSystemTime(new Date('2026-12-15T12:00:00Z'))
	const element = document.createElement('div')
	const fetchedRanges: [string, string][] = []
	const timezone = getTimezoneManager().getTimezoneForId(timeZone)
	const calendar = new Calendar(element, {
		...getDateFormattingConfig(timezone),
		plugins: [listPlugin, VTimezoneNamedTimezone, dateLabels],
		initialView: getCalendarView('listMonth', show),
		initialDate: getYYYYMMDDFromFirstdayParam(firstDay),
		headerToolbar: false,
		timeZone,
		events: ({ startStr, endStr }, success) => {
			fetchedRanges.push([startStr.slice(0, 10), endStr.slice(0, 10)])
			success([
				{ start: '2026-11-30', title: 'Previous month' },
				{ start: '2026-12-01', title: 'First of the month' },
				{ start: '2026-12-29', title: 'Late December' },
				{ start: '2027-01-07', title: 'January event' },
				{ start: '2027-12-15', title: 'Yearly end date' },
			])
		},
	})

	try {
		calendar.render()

		expect(fetchedRanges).toEqual([['2026-12-01', end]])
		const titles = Array.from(element.querySelectorAll('.fc-list-event-title'), (title) => title.textContent)
		expect(titles).toEqual(includesJanuary
			? ['First of the month', 'Late December', 'January event']
			: ['First of the month', 'Late December'])
	} finally {
		calendar.destroy()
		vi.useRealTimers()
	}
})
