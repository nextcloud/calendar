/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import FreeBusy from '@/components/Editor/FreeBusy/FreeBusy.vue'
import { getBusySlots, getFirstFreeSlot } from '@/services/freeBusySlotService.js'

import 'moment/locale/en-gb'
import 'moment/locale/nl'

vi.mock('@/services/freeBusySlotService.js', () => ({
	getBusySlots: vi.fn(),
	getFirstFreeSlot: vi.fn(),
}))

describe('components/Editor/FreeBusy/FreeBusy', () => {
	const currentStart = new Date(2026, 10, 19, 13, 0)
	const currentEnd = new Date(2026, 10, 19, 13, 30)

	it('formats the time range with a 24-hour clock for a 24-hour locale', () => {
		const range = FreeBusy.computed.formattedCurrentTime.call({ currentStart, currentEnd, locale: 'en-gb' })

		expect(range.trim()).toBe('13:00 - 13:30')
	})

	it('formats the time range with a 12-hour clock for a 12-hour locale', () => {
		const range = FreeBusy.computed.formattedCurrentTime.call({ currentStart, currentEnd, locale: 'en' })

		expect(range.trim()).toBe('1:00 PM - 1:30 PM')
	})

	it('formats the date in the order of the locale', () => {
		const format = (locale) => FreeBusy.computed.formattedCurrentStart.call({ currentStart, currentEnd, locale })

		expect(format('en')).toBe('Thursday, November 19, 2026')
		expect(format('en-gb')).toBe('Thursday, 19 November 2026')
		expect(format('nl')).toBe('donderdag, 19 november 2026')
	})

	it('formats both dates of a multi-day range in the order of the locale', () => {
		const range = FreeBusy.computed.formattedCurrentStart.call({ currentStart, currentEnd: new Date(2026, 10, 20, 9, 0), locale: 'en-gb' })

		expect(range).toBe('Thursday, 19 November 2026 - Friday, 20 November 2026')
	})

	it('formats the suggested free slots in the locale', async () => {
		getBusySlots.mockResolvedValue({ events: [] })
		getFirstFreeSlot.mockReturnValue([{ start: new Date(2026, 10, 20, 15, 0), end: new Date(2026, 10, 20, 15, 30) }])
		const context = {
			currentStart,
			currentEnd,
			organizer: { attendeeProperty: {} },
			attendees: [],
			timezoneId: 'Europe/Amsterdam',
			locale: 'en-gb',
			freeSlots: [],
		}

		await FreeBusy.methods.findFreeSlots.call(context)

		expect(context.freeSlots[0].displayStart).toBe('20 Nov 2026 15:00')
	})
})
