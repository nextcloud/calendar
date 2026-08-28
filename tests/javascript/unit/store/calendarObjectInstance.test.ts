/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { mapAlarmComponentToAlarmObject } from '@/models/alarm.js'
import { copyCalendarObjectInstanceIntoEventComponent, mapEventComponentToEventObject } from '@/models/event.js'
import useCalendarObjectInstanceStore from '@/store/calendarObjectInstance.js'
import useCalendarObjectsStore from '@/store/calendarObjects.js'
import { getObjectAtRecurrenceId } from '@/utils/calendarObject.js'

vi.mock('@/models/alarm.js')
vi.mock('@/models/event.js')
vi.mock('@/utils/calendarObject.js')

const mockedMapAlarmComponentToAlarmObject = vi.mocked(mapAlarmComponentToAlarmObject)
const mockedCopyCalendarObjectInstanceIntoEventComponent = vi.mocked(copyCalendarObjectInstanceIntoEventComponent)
const mockedMapEventComponentToEventObject = vi.mocked(mapEventComponentToEventObject)
const mockedGetObjectAtRecurrenceId = vi.mocked(getObjectAtRecurrenceId)

describe('store/calendarObjectInstance test suite', () => {
	beforeEach(() => {
		setActivePinia(createPinia())

		mockedMapAlarmComponentToAlarmObject.mockReset()
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

	describe('addAlarmToCalendarObjectInstance', () => {
		it('adds the alarm to an explicitly given calendar-object-instance instead of the store state', () => {
			const store = useCalendarObjectInstanceStore()
			// No event is currently loaded into the store, e.g. when creating the very first event of a session
			store.calendarObjectInstance = null

			const alarmComponent = { addProperty: vi.fn(), toICALJs: vi.fn().mockReturnValue({ toString: () => '' }) }
			const eventComponent = { addRelativeAlarm: vi.fn().mockReturnValue(alarmComponent) }
			const calendarObjectInstance = { eventComponent, alarms: [] }
			const alarmObject = { alarmComponent }
			mockedMapAlarmComponentToAlarmObject.mockReturnValue(alarmObject)

			expect(() => store.addAlarmToCalendarObjectInstance({
				calendarObjectInstance,
				type: 'DISPLAY',
				totalSeconds: -600,
			})).not.toThrow()

			expect(calendarObjectInstance.alarms).toContain(alarmObject)
		})

		it('falls back to the calendar-object-instance in the store when none is given', () => {
			const store = useCalendarObjectInstanceStore()
			const alarmComponent = { addProperty: vi.fn(), toICALJs: vi.fn().mockReturnValue({ toString: () => '' }) }
			const eventComponent = { addRelativeAlarm: vi.fn().mockReturnValue(alarmComponent) }
			store.calendarObjectInstance = { eventComponent, alarms: [] }
			const alarmObject = { alarmComponent }
			mockedMapAlarmComponentToAlarmObject.mockReturnValue(alarmObject)

			store.addAlarmToCalendarObjectInstance({
				type: 'DISPLAY',
				totalSeconds: -600,
			})

			expect(store.calendarObjectInstance.alarms).toContainEqual(alarmObject)
		})
	})

	describe('removeAlarmFromCalendarObjectInstance', () => {
		it('removes the alarm from an explicitly given calendar-object-instance instead of the store state', () => {
			const store = useCalendarObjectInstanceStore()
			// No event is currently loaded into the store, e.g. when creating the very first event of a session
			store.calendarObjectInstance = null

			const matchedAlarmComponent = { trigger: { value: { totalSeconds: -600 } }, action: 'DISPLAY' }
			const eventComponent = {
				getAlarmIterator: () => [matchedAlarmComponent],
				removeAlarm: vi.fn(),
			}
			const alarm = { alarmComponent: matchedAlarmComponent }
			const calendarObjectInstance = { eventComponent, alarms: [alarm] }

			expect(() => store.removeAlarmFromCalendarObjectInstance({
				calendarObjectInstance,
				alarm,
			})).not.toThrow()

			expect(eventComponent.removeAlarm).toHaveBeenCalledWith(matchedAlarmComponent)
			expect(calendarObjectInstance.alarms).not.toContain(alarm)
		})
	})
})
