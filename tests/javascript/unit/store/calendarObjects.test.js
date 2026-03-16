/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useCalendarObjectsStore from '../../../../src/store/calendarObjects.js'

vi.mock('@nextcloud/calendar-js', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		getParserManager: vi.fn(() => ({
			getParserForFileType: vi.fn(() => ({
				parse: vi.fn(),
				getItemIterator: vi.fn(() => ({ next: vi.fn(() => ({ value: null })) })),
			})),
		})),
	}
})

vi.mock('@nextcloud/timezones', () => ({
	getTimezoneManager: vi.fn(() => ({
		getTimezoneForId: vi.fn((id) => ({ timezoneId: id })),
	})),
}))

function createMinimalCalendarObject(etagAfterUpdate = '"valid-etag"') {
	const dav = {
		data: null,
		etag: '"old-etag"',
		url: '/remote.php/dav/calendars/admin/personal/event.ics',
		update: vi.fn(async function() {
			this.etag = etagAfterUpdate
		}),
		fetchCompleteData: vi.fn(async function() {
			this.etag = '"new-etag-from-propfind"'
		}),
	}
	return {
		id: btoa('/remote.php/dav/calendars/admin/personal/event.ics'),
		calendarId: btoa('/remote.php/dav/calendars/admin/personal/'),
		existsOnServer: true,
		dav,
		calendarComponent: {
			toICS: vi.fn(() => 'BEGIN:VCALENDAR\r\nEND:VCALENDAR'),
		},
	}
}

describe('store/calendarObjects test suite', () => {
	it('should be true', () => {
		expect(true).toEqual(true)
	})
})

describe('store/calendarObjects — updateCalendarObject ETag fix', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('should NOT call fetchCompleteData when server returns a valid ETag', async () => {
		const store = useCalendarObjectsStore()
		const calendarObject = createMinimalCalendarObject('"valid-etag"')
		store.calendarObjects[calendarObject.id] = calendarObject

		await store.updateCalendarObject({ calendarObject })

		expect(calendarObject.dav.fetchCompleteData).not.toHaveBeenCalled()
	})

	it('should call fetchCompleteData(true) when server returns null ETag', async () => {
		const store = useCalendarObjectsStore()
		const calendarObject = createMinimalCalendarObject(null)
		store.calendarObjects[calendarObject.id] = calendarObject

		await store.updateCalendarObject({ calendarObject })

		expect(calendarObject.dav.fetchCompleteData).toHaveBeenCalledOnce()
		expect(calendarObject.dav.fetchCompleteData).toHaveBeenCalledWith(true)
		expect(calendarObject.dav.etag).toBe('"new-etag-from-propfind"')
	})

	it('should continue normally if fetchCompleteData throws', async () => {
		const store = useCalendarObjectsStore()
		const calendarObject = createMinimalCalendarObject(null)
		store.calendarObjects[calendarObject.id] = calendarObject

		calendarObject.dav.fetchCompleteData = vi.fn(async () => {
			throw new Error('PROPFIND failed')
		})

		await expect(store.updateCalendarObject({ calendarObject })).resolves.toBeUndefined()
	})
})
