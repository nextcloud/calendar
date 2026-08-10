/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { copyCalendarObjectInstanceIntoEventComponent, mapEventComponentToEventObject } from '@/models/event.js'
import useCalendarObjectInstanceStore from '@/store/calendarObjectInstance.js'
import useCalendarObjectsStore from '@/store/calendarObjects.js'
import { getObjectAtRecurrenceId } from '@/utils/calendarObject.js'

vi.mock('@/models/event.js')
vi.mock('@/utils/calendarObject.js')

const mockedCopyCalendarObjectInstanceIntoEventComponent = vi.mocked(copyCalendarObjectInstanceIntoEventComponent)
const mockedMapEventComponentToEventObject = vi.mocked(mapEventComponentToEventObject)
const mockedGetObjectAtRecurrenceId = vi.mocked(getObjectAtRecurrenceId)

describe('store/calendarObjectInstance test suite', () => {
	beforeEach(() => {
		setActivePinia(createPinia())

		mockedCopyCalendarObjectInstanceIntoEventComponent.mockReset()
		mockedMapEventComponentToEventObject.mockReset().mockReturnValue({ eventComponent: {} })
		mockedGetObjectAtRecurrenceId.mockReset().mockReturnValue({})
	})

	describe('duplicateCalendarObjectInstance', () => {
		/**
		 * @param store The calendarObjectInstance store
		 * @param calendarId The id of the calendar the source event lives in
		 */
		function setUpSourceEvent(store: ReturnType<typeof useCalendarObjectInstanceStore>, calendarId: string) {
			store.calendarObject = { calendarId }
			store.calendarObjectInstance = {
				eventComponent: {
					startDate: {
						timezoneId: 'UTC',
						getInUTC: () => ({ unixTime: 1000, jsDate: new Date(1000 * 1000) }),
					},
					endDate: {
						getInUTC: () => ({ unixTime: 2000 }),
					},
					isAllDay: () => false,
				},
			}
		}

		it('duplicates into the explicitly given calendar instead of the source calendar', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			setUpSourceEvent(store, 'readonly-calendar')
			vi.spyOn(calendarObjectsStore, 'createNewEvent').mockResolvedValue({ calendarComponent: {} })

			await store.duplicateCalendarObjectInstance({ calendarId: 'writable-calendar' })

			expect(calendarObjectsStore.createNewEvent).toHaveBeenCalledWith(
				expect.objectContaining({ calendarId: 'writable-calendar' }),
			)
		})

		it('falls back to the source calendar when no calendarId is given', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			setUpSourceEvent(store, 'source-calendar')
			vi.spyOn(calendarObjectsStore, 'createNewEvent').mockResolvedValue({ calendarComponent: {} })

			await store.duplicateCalendarObjectInstance()

			expect(calendarObjectsStore.createNewEvent).toHaveBeenCalledWith(
				expect.objectContaining({ calendarId: 'source-calendar' }),
			)
		})

		it('marks the duplicated event as a new, unsaved calendar-object', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			setUpSourceEvent(store, 'source-calendar')
			const newCalendarObject = { calendarComponent: {} }
			vi.spyOn(calendarObjectsStore, 'createNewEvent').mockResolvedValue(newCalendarObject)

			await store.duplicateCalendarObjectInstance({ calendarId: 'writable-calendar' })

			expect(store.isNew).toBe(true)
			expect(store.calendarObject).toStrictEqual(newCalendarObject)
		})
	})
})
