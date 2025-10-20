/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createEvent, DateTimeValue, getParserManager } from '@nextcloud/calendar-js'
import { showWarning } from '@nextcloud/dialogs'
import { translate } from '@nextcloud/l10n'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { markRaw } from 'vue'
import { mapAlarmComponentToAlarmObject } from '@/models/alarm.js'
import { copyCalendarObjectInstanceIntoEventComponent, mapEventComponentToEventObject } from '@/models/event.js'
import { updateRoomParticipantsFromEvent } from '@/services/talkService'
import getTimezoneManager from '@/services/timezoneDataProviderService.js'
import useCalendarObjectInstanceStore from '@/store/calendarObjectInstance.js'
import useCalendarObjectsStore from '@/store/calendarObjects.js'
import { getObjectAtRecurrenceId, isBaseOccurrence } from '@/utils/calendarObject.js'
import logger from '@/utils/logger.js'

vi.mock('@/models/alarm.js')
vi.mock('@/models/event.js')
vi.mock('@/services/talkService')
vi.mock('@/utils/calendarObject.js')
vi.mock('@nextcloud/dialogs')
vi.mock('@nextcloud/l10n')

const mockedMapAlarmComponentToAlarmObject = vi.mocked(mapAlarmComponentToAlarmObject)
const mockedCopyCalendarObjectInstanceIntoEventComponent = vi.mocked(copyCalendarObjectInstanceIntoEventComponent)
const mockedMapEventComponentToEventObject = vi.mocked(mapEventComponentToEventObject)
const mockedGetObjectAtRecurrenceId = vi.mocked(getObjectAtRecurrenceId)
const mockedisBaseOccurrence = vi.mocked(isBaseOccurrence)

/**
 * Builds a minimal fake DateTimeValue-like object, just enough for the
 * comparison/arithmetic the store performs when deciding whether an
 * occurrence's date/time was changed, plus the date-component getters
 * getDateFromDateTimeValue() reads when reverting a discarded change.
 *
 * @param time Point in time, treated as unix seconds (UTC)
 */
function fakeDateTime(time: number) {
	return {
		time,
		timezoneId: undefined as string | undefined,
		get year() {
			return new Date(this.time * 1000).getFullYear()
		},
		get month() {
			return new Date(this.time * 1000).getMonth() + 1
		},
		get day() {
			return new Date(this.time * 1000).getDate()
		},
		get hour() {
			return new Date(this.time * 1000).getHours()
		},
		get minute() {
			return new Date(this.time * 1000).getMinutes()
		},
		compare(other: { time: number }) {
			if (this.time === other.time) {
				return 0
			}
			return this.time < other.time ? -1 : 1
		},
		clone() {
			return fakeDateTime(this.time)
		},
		addDuration(duration: { seconds: number }) {
			this.time += duration.seconds
		},
		subtractDateWithTimezone(other: { time: number }) {
			return fakeDuration(this.time - other.time)
		},
	}
}

/**
 * Builds a minimal fake DurationValue-like object, just enough for the
 * length comparison the store performs when deciding whether an
 * occurrence's duration was changed.
 *
 * @param seconds Length of the duration, in arbitrary units
 */
function fakeDuration(seconds: number) {
	return {
		seconds,
		compare(other: { seconds: number }) {
			if (this.seconds === other.seconds) {
				return 0
			}
			return this.seconds < other.seconds ? -1 : 1
		},
	}
}

describe('store/calendarObjectInstance test suite', () => {
	beforeEach(() => {
		setActivePinia(createPinia())

		mockedMapAlarmComponentToAlarmObject.mockReset()
		mockedCopyCalendarObjectInstanceIntoEventComponent.mockReset()
		mockedMapEventComponentToEventObject.mockReset().mockReturnValue({ eventComponent: {} })
		mockedGetObjectAtRecurrenceId.mockReset().mockReturnValue({})
		mockedisBaseOccurrence.mockReset()
		vi.mocked(showWarning).mockClear()
		vi.mocked(translate).mockClear().mockReturnValue('translated warning')
		vi.mocked(updateRoomParticipantsFromEvent).mockClear()
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

			expect(calendarObjectsStore.createNewEvent).toHaveBeenCalledWith(expect.objectContaining({ calendarId: 'writable-calendar' }))
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

	describe('saveAttendeeParticipationResponse', () => {
		it('updates the recurring master when responding to a generated occurrence', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const masterAttendee = {
				email: 'attendee@example.com',
				participationStatus: 'NEEDS-ACTION',
			}
			const masterComponent = {
				name: 'VEVENT',
				hasProperty: vi.fn().mockReturnValue(false),
				getAttendeeIterator: vi.fn().mockReturnValue([masterAttendee]),
			}
			const occurrenceAttendee = {
				email: 'ATTENDEE@example.com',
				participationStatus: 'NEEDS-ACTION',
			}
			const eventComponent = {
				name: 'VEVENT',
				isRecurrenceException: vi.fn().mockReturnValue(false),
			}
			const attendee = {
				attendeeProperty: occurrenceAttendee,
				participationStatus: 'NEEDS-ACTION',
			}
			const calendarObject = {
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([masterComponent]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.saveAttendeeParticipationResponse({
				attendee,
				participationStatus: 'ACCEPTED',
			})

			expect(masterAttendee.participationStatus).toBe('ACCEPTED')
			expect(occurrenceAttendee.participationStatus).toBe('NEEDS-ACTION')
			expect(attendee.participationStatus).toBe('ACCEPTED')
			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
		})

		it('updates an existing recurrence exception without changing the master', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const masterAttendee = {
				email: 'attendee@example.com',
				participationStatus: 'ACCEPTED',
			}
			const exceptionAttendee = {
				email: 'attendee@example.com',
				participationStatus: 'NEEDS-ACTION',
			}
			const eventComponent = {
				name: 'VEVENT',
				isRecurrenceException: vi.fn().mockReturnValue(true),
			}
			const attendee = {
				attendeeProperty: exceptionAttendee,
				participationStatus: 'NEEDS-ACTION',
			}
			const calendarObject = {
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([{
						name: 'VEVENT',
						getAttendeeIterator: vi.fn().mockReturnValue([masterAttendee]),
					}]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.saveAttendeeParticipationResponse({
				attendee,
				participationStatus: 'DECLINED',
			})

			expect(exceptionAttendee.participationStatus).toBe('DECLINED')
			expect(masterAttendee.participationStatus).toBe('ACCEPTED')
			expect(attendee.participationStatus).toBe('DECLINED')
			expect(calendarObject.calendarComponent.getComponentIterator).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
		})
	})

	describe('saveCalendarObjectInstance', () => {
		/**
		 * Whether eventComponent is the primary occurrence is decided by the mocked
		 * isBaseOccurrence() (configured per test below) - it has its
		 * own dedicated, real-calendar-js-backed tests in utils/calendarObject.test.js,
		 * including the DTSTART-misalignment edge case.
		 *
		 * @param baseStart Base component's own DTSTART
		 * @param baseEnd Base component's own DTEND
		 */
		function setUpBaseComponent(baseStart: number, baseEnd: number) {
			const baseProperty = {
				name: 'SUMMARY',
			}
			return {
				name: 'VEVENT',
				hasProperty: vi.fn().mockReturnValue(false),
				getPropertyIterator: vi.fn().mockReturnValue([baseProperty]),
				deleteAllProperties: vi.fn(),
				addProperty: vi.fn(),
				deleteAllComponents: vi.fn(),
				addComponent: vi.fn(),
				startDate: fakeDateTime(baseStart),
				endDate: fakeDateTime(baseEnd),
				recurrenceManager: {
					// Overridden per-test via mockReturnValue() where the non-primary-occurrence
					// branch needs to look up the actual, unedited occurrence.
					getOccurrenceAtExactly: vi.fn(),
				},
			}
		}

		/**
		 * @param originalRecurrenceId The occurrence's original (pre-edit) recurrence-id, or null when not forked
		 * @param start The occurrence's current (possibly edited) start time
		 * @param end The occurrence's current (possibly edited) end time
		 */
		function setUpEventComponent(originalRecurrenceId: number | null, start: number, end: number) {
			const exceptionPropertyClone = {}
			const exceptionProperty = {
				name: 'SUMMARY',
				clone: vi.fn().mockReturnValue(exceptionPropertyClone),
			}
			return {
				name: 'VEVENT',
				primaryItem: {},
				isDirty: vi.fn().mockReturnValue(true),
				isPartOfRecurrenceSet: vi.fn().mockReturnValue(true),
				isRecurrenceException: vi.fn().mockReturnValue(false),
				isAllDay: vi.fn().mockReturnValue(false),
				// Deliberately left undefined by default (only given a real mock where a
				// test needs it) - some tests rely on these being unmocked so they throw
				// loudly if an early-return guard is ever bypassed unexpectedly.
				canCreateRecurrenceExceptions: undefined as unknown as (() => boolean) | undefined,
				createRecurrenceException: undefined as unknown as ((thisAndAllFuture: boolean) => [unknown, unknown]) | undefined,
				getPropertyIterator: vi.fn().mockReturnValue([exceptionProperty]),
				getAlarmIterator: vi.fn().mockReturnValue([]),
				resetDirty: vi.fn(),
				originalRecurrenceId: originalRecurrenceId === null ? null : fakeDateTime(originalRecurrenceId),
				startDate: fakeDateTime(start),
				endDate: fakeDateTime(end),
			}
		}

		it('updates the recurring base component when saving the series from an unmoved exception', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const baseComponent = setUpBaseComponent(1000, 2000)
			// Same recurrence-id it was forked at, and the date/time weren't touched
			const exceptionComponent = setUpEventComponent(5000, 5000, 6000)
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, exceptionComponent]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: exceptionComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(false)
			// The real, unedited occurrence - same position/length as the (unchanged) exception
			baseComponent.recurrenceManager.getOccurrenceAtExactly.mockReturnValue({
				startDate: fakeDateTime(5000),
				endDate: fakeDateTime(6000),
				isAllDay: vi.fn().mockReturnValue(false),
			})

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			expect(baseComponent.deleteAllProperties).toHaveBeenCalledWith('SUMMARY')
			expect(baseComponent.addProperty).toHaveBeenCalledWith(expect.anything())
			expect(baseComponent.startDate.time).toBe(1000)
			expect(baseComponent.endDate.time).toBe(2000)
			expect(showWarning).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
			expect(exceptionComponent.resetDirty).toHaveBeenCalled()
			expect(updateRoomParticipantsFromEvent).toHaveBeenCalledWith(exceptionComponent)
		})

		it('copies a property onto the base component even when the base component never had it before', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			// The base component has no LOCATION property at all yet
			const baseComponent = setUpBaseComponent(1000, 2000)
			const locationPropertyClone = { marker: 'location-clone' }
			const locationProperty = {
				name: 'LOCATION',
				clone: vi.fn().mockReturnValue(locationPropertyClone),
			}
			const primaryOccurrence = setUpEventComponent(1000, 1000, 2000)
			// The user just added a location for the first time
			primaryOccurrence.getPropertyIterator = vi.fn().mockReturnValue([...primaryOccurrence.getPropertyIterator(), locationProperty])
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, primaryOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: primaryOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(true)

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			expect(baseComponent.addProperty).toHaveBeenCalledWith(locationPropertyClone)
		})

		it('resets the dirty state of the throwaway fork after a successful series save, so closing the editor does not prompt to discard changes', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const baseComponent = setUpBaseComponent(1000, 2000)
			const primaryOccurrence = setUpEventComponent(1000, 1500, 2500)
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, primaryOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: primaryOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(true)

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			// eventComponent is a throwaway fork never added to the calendar-object's
			// component tree, so calendarComponent.toICS() never undirtifies it on its own
			expect(primaryOccurrence.resetDirty).toHaveBeenCalled()
		})

		it.each(['series', 'future'] as const)('refuses to save %s-wide changes while editing an existing recurrence exception', async (scope) => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const baseComponent = setUpBaseComponent(1000, 2000)
			const exceptionOccurrence = setUpEventComponent(1000, 1000, 2000)
			exceptionOccurrence.isRecurrenceException = vi.fn().mockReturnValue(true)
			// "future" would otherwise reach createRecurrenceException(), which isn't
			// stubbed here - if the early return is ever bypassed, this throws loudly
			// instead of silently succeeding against an undefined method.
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, exceptionOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: exceptionOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'moveCalendarObject').mockResolvedValue()

			// calendarId also differs from calendarObject.calendarId here, to pin down that
			// the early return bails out of the whole action - including the calendar move
			// below, which is otherwise unrelated to scope - not just the series-wide copy.
			await store.saveCalendarObjectInstance({
				scope,
				calendarId: 'calendar-2',
			})

			// The base component's RRULE/RDATE/EXDATE (and everything else) must be left
			// completely untouched - an exception has none of these to (wrongly) copy over
			expect(baseComponent.deleteAllProperties).not.toHaveBeenCalled()
			expect(baseComponent.addProperty).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).not.toHaveBeenCalled()
			expect(calendarObjectsStore.moveCalendarObject).not.toHaveBeenCalled()
		})

		it('allows resaving an already-existing recurrence exception with occurrence scope', async () => {
			// A fork of an already-existing exception can't itself create a further
			// exception: calendar-js's canCreateRecurrenceExceptions() is false here
			// because neither the fork nor its primaryItem (the stored exception
			// itself) carries an RRULE/RDATE - only the master does. So this is the
			// one path that's supposed to keep working for an exception: the guard
			// above must not trip (scope is 'occurrence'), and createRecurrenceException
			// must not be called since it isn't needed - the fork already IS backed by
			// the real, already-existing exception component.
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const exceptionComponent = setUpEventComponent(1000, 1500, 2500)
			exceptionComponent.isRecurrenceException = vi.fn().mockReturnValue(true)
			exceptionComponent.canCreateRecurrenceExceptions = vi.fn().mockReturnValue(false)
			exceptionComponent.createRecurrenceException = vi.fn()
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: exceptionComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.saveCalendarObjectInstance({
				scope: 'occurrence',
				calendarId: 'calendar-1',
			})

			expect(exceptionComponent.createRecurrenceException).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
		})

		it.each(['occurrence', 'future'] as const)('refuses to save %s-wide changes while editing the primary occurrence of a series', async (scope) => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const baseComponent = setUpBaseComponent(1000, 2000)
			const primaryOccurrence = setUpEventComponent(1000, 1000, 2000)
			// "occurrence"/"future" would otherwise reach createRecurrenceException(), which
			// isn't stubbed here - if the early return is ever bypassed, this throws loudly
			// instead of silently succeeding against an undefined method.
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, primaryOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: primaryOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(true)

			await store.saveCalendarObjectInstance({
				scope,
				calendarId: 'calendar-1',
			})

			expect(baseComponent.deleteAllProperties).not.toHaveBeenCalled()
			expect(baseComponent.addProperty).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).not.toHaveBeenCalled()
		})

		it('does not consult isBaseOccurrence() for a brand new, never-forked event', async () => {
			// Regression test: isBaseOccurrence() calls isPartOfRecurrenceSet(), which
			// needs a recurrence-manager/master item a brand new event doesn't have yet
			// - calling it unconditionally here crashed real, fresh event creation.
			// The primary-occurrence guard must only run for forked items (primaryItem
			// !== null), exactly like the canCreateRecurrenceExceptions() check right
			// below it. mockedisBaseOccurrence would normally refuse this save if
			// consulted - it isn't, because isForkedItem is false here.
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const newEventComponent = setUpEventComponent(null, 1000, 2000)
			newEventComponent.primaryItem = null
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
				existsOnServer: false,
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: newEventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(true)

			await store.saveCalendarObjectInstance({
				scope: 'occurrence',
				calendarId: 'calendar-1',
			})

			expect(mockedisBaseOccurrence).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
		})

		it('applies the date/time change when editing the primary occurrence of the series', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const baseComponent = setUpBaseComponent(1000, 2000)
			// Forked at the base component's own date, and then moved
			const primaryOccurrence = setUpEventComponent(1000, 1500, 2500)
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, primaryOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: primaryOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(true)

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			expect(baseComponent.startDate.time).toBe(1500)
			expect(baseComponent.endDate.time).toBe(2500)
			expect(showWarning).not.toHaveBeenCalled()
		})

		it('discards the date/time change and warns when a non-primary occurrence was moved', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			// Values are whole minutes (seconds always 0) since getDateFromDateTimeValue()
			// always truncates seconds - keeps the reverted-Date assertions below exact.
			const baseComponent = setUpBaseComponent(60_000, 120_000)
			// Forked at 300_000, but then moved to 359_940/420_000
			const movedOccurrence = setUpEventComponent(300_000, 359_940, 420_000)
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, movedOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: movedOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(false)
			// The real, unedited occurrence - what the editor should revert back to
			baseComponent.recurrenceManager.getOccurrenceAtExactly.mockReturnValue({ startDate: fakeDateTime(300_000), endDate: fakeDateTime(360_000) })

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			expect(baseComponent.startDate.time).toBe(60_000)
			expect(baseComponent.endDate.time).toBe(120_000)
			expect(showWarning).toHaveBeenCalledTimes(1)
			expect(showWarning).toHaveBeenCalledWith('translated warning')

			// The editor itself must also stop showing the discarded change -
			// otherwise it displays a time that was never actually saved, while
			// the calendar grid (reading the real, unchanged data) shows the truth.
			expect(movedOccurrence.startDate.time).toBe(300_000)
			expect(movedOccurrence.endDate.time).toBe(360_000)
			expect(store.calendarObjectInstance.startDate).toStrictEqual(new Date(300_000 * 1000))
			expect(store.calendarObjectInstance.endDate).toStrictEqual(new Date(360_000 * 1000))
		})

		it('looks up an all-day occurrence by its real DateTimeValue, not a lossy JS-Date round-trip', async () => {
			// Regression test for a real bug: the store used to look up the unedited
			// occurrence via getObjectAtRecurrenceId(calendarObject, originalRecurrenceId.jsDate),
			// which converts the DateTimeValue to a JS Date and back. That round-trip
			// silently drops the isDate (all-day) flag (DateTimeValue.fromJSDate() defaults
			// isDate to false), so the reconstructed lookup no longer matches the real
			// all-day occurrence's own recurrence-id and returns null - crashing on
			// originalOccurrence.startDate. Only a real DateTimeValue (mocks can't fake
			// isDate semantics) can catch this, hence the real, unmocked calendar-js here.
			//
			// The round trip only loses information when the local UTC offset isn't
			// exactly zero (an isDate value's .jsDate is local midnight; reading it
			// back via UTC getters only recovers the same instant when offset === 0).
			// Pin a fixed, known non-UTC zone here so this stays deterministic
			// regardless of the host machine's own timezone (this test previously
			// passed or failed purely based on whatever TZ happened to be ambient).
			const originalTz = process.env.TZ
			process.env.TZ = 'America/New_York'
			try {
				getTimezoneManager()

				const ics = [
					'BEGIN:VCALENDAR',
					'VERSION:2.0',
					'PRODID:-//Nextcloud//calendar-js tests//EN',
					'BEGIN:VEVENT',
					'UID:all-day-series-test',
					'DTSTART;VALUE=DATE:20260907',
					'DTEND;VALUE=DATE:20260908',
					'DTSTAMP:20260901T000000Z',
					'SUMMARY:All-day recurring test',
					'RRULE:FREQ=WEEKLY;COUNT=4;BYDAY=MO',
					'END:VEVENT',
					'END:VCALENDAR',
				].join('\r\n')

				const parser = getParserManager().getParserForFileType('text/calendar')
				parser.parse(ics)
				const calendarComponent = parser.getItemIterator().next().value

				let baseComponent = null
				for (const component of calendarComponent.getComponentIterator()) {
					if (component.name === 'VEVENT' && !component.hasProperty('RECURRENCE-ID')) {
						baseComponent = component
					}
				}
				const rangeEnd = baseComponent.startDate.clone()
				rangeEnd.year += 1
				const secondOccurrence = baseComponent.recurrenceManager.getAllOccurrencesBetween(baseComponent.startDate, rangeEnd)[1]
				const secondOccurrenceRecurrenceId = secondOccurrence.getReferenceRecurrenceId()
				expect(secondOccurrenceRecurrenceId.isDate).toBe(true)

				// What the store now does: pass the DateTimeValue straight through, no JS-Date round-trip
				const viaDirectLookup = baseComponent.recurrenceManager.getOccurrenceAtExactly(secondOccurrenceRecurrenceId)
				expect(viaDirectLookup).not.toBeNull()
				expect(viaDirectLookup.startDate.compare(secondOccurrenceRecurrenceId)).toBe(0)

				// What the store used to do: DateTimeValue -> JS Date -> DateTimeValue, losing isDate
				const jsDateRoundTripped = DateTimeValue.fromJSDate(secondOccurrenceRecurrenceId.jsDate, true)
				expect(jsDateRoundTripped.isDate).toBe(false)
				expect(baseComponent.recurrenceManager.getOccurrenceAtExactly(jsDateRoundTripped)).toBeNull()
			} finally {
				process.env.TZ = originalTz
			}
		})

		it('does not crash saving a brand new, non-recurring event (real calendar-js)', async () => {
			// Regression test: the primary-occurrence/exception guards must live inside
			// their own scope-specific if-blocks, not run unconditionally for every save -
			// isBaseOccurrence() calls eventComponent.isPartOfRecurrenceSet(), which is only
			// meaningful once a recurrence-manager and master item exist. Calling it up front
			// for a brand new event's first save previously broke saving new events entirely.
			const start = DateTimeValue.fromJSDate(new Date('2026-09-07T10:00:00Z'), true)
			const end = DateTimeValue.fromJSDate(new Date('2026-09-07T11:00:00Z'), true)
			const calendarComponent = createEvent(start, end)
			const eventComponent = calendarComponent.getVObjectIterator().next().value
			eventComponent.updatePropertyWithValue('SUMMARY', 'New event')
			eventComponent.markDirty()

			const calendarObject = { calendarComponent, calendarId: 'personal', existsOnServer: false }

			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await expect(store.saveCalendarObjectInstance({
				scope: 'occurrence',
				calendarId: 'personal',
			})).resolves.not.toThrow()

			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
		})

		it('moves the calendar-object without saving when the event is not dirty', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(1000, 1000, 2000)
			eventComponent.isDirty = vi.fn().mockReturnValue(false)
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'moveCalendarObject').mockResolvedValue()

			await store.saveCalendarObjectInstance({
				scope: 'occurrence',
				calendarId: 'calendar-2',
			})

			expect(calendarObjectsStore.moveCalendarObject).toHaveBeenCalledWith({
				calendarObject,
				newCalendarId: 'calendar-2',
			})
			expect(calendarObjectsStore.updateCalendarObject).not.toHaveBeenCalled()
		})

		it('does nothing when series scope is requested for a non-recurring event', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(null, 1000, 2000)
			eventComponent.isPartOfRecurrenceSet = vi.fn().mockReturnValue(false)
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'moveCalendarObject').mockResolvedValue()

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			expect(calendarObjectsStore.updateCalendarObject).not.toHaveBeenCalled()
			expect(calendarObjectsStore.moveCalendarObject).not.toHaveBeenCalled()
			expect(eventComponent.resetDirty).not.toHaveBeenCalled()
		})

		it('logs an error and does nothing further when the base/master component cannot be found', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(1000, 1000, 2000)
			// No component without RECURRENCE-ID exists in the tree at all
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'moveCalendarObject').mockResolvedValue()
			vi.spyOn(logger, 'error').mockImplementation(() => {})

			await expect(store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})).resolves.not.toThrow()

			expect(logger.error).toHaveBeenCalledWith('Could not find master component to save series-wide changes to')
			expect(calendarObjectsStore.updateCalendarObject).not.toHaveBeenCalled()
			expect(calendarObjectsStore.moveCalendarObject).not.toHaveBeenCalled()
			expect(eventComponent.resetDirty).not.toHaveBeenCalled()
		})

		it('discards the change and warns when only the timezone differs on a non-primary occurrence', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const baseComponent = setUpBaseComponent(1000, 2000)
			const movedOccurrence = setUpEventComponent(5000, 5000, 6000)
			// Same instant as the original occurrence, but a different timezoneId
			movedOccurrence.startDate.timezoneId = 'Europe/Vienna'
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, movedOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: movedOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(false)
			const originalStart = fakeDateTime(5000)
			originalStart.timezoneId = 'UTC'
			baseComponent.recurrenceManager.getOccurrenceAtExactly.mockReturnValue({
				startDate: originalStart,
				endDate: fakeDateTime(6000),
				isAllDay: vi.fn().mockReturnValue(false),
			})

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			expect(showWarning).toHaveBeenCalledTimes(1)
			expect(baseComponent.startDate.time).toBe(1000)
			expect(baseComponent.endDate.time).toBe(2000)
		})

		it('discards the change and warns when only the all-day flag differs on a non-primary occurrence', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const baseComponent = setUpBaseComponent(1000, 2000)
			const movedOccurrence = setUpEventComponent(5000, 5000, 6000)
			// Same start/end instant and timezone as the original occurrence, but toggled to all-day
			movedOccurrence.isAllDay = vi.fn().mockReturnValue(true)
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([baseComponent, movedOccurrence]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: movedOccurrence }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(false)
			baseComponent.recurrenceManager.getOccurrenceAtExactly.mockReturnValue({
				startDate: fakeDateTime(5000),
				endDate: fakeDateTime(6000),
				isAllDay: vi.fn().mockReturnValue(false),
			})

			await store.saveCalendarObjectInstance({
				scope: 'series',
				calendarId: 'calendar-1',
			})

			expect(showWarning).toHaveBeenCalledTimes(1)
			expect(baseComponent.startDate.time).toBe(1000)
			expect(baseComponent.endDate.time).toBe(2000)
		})

		it.each([
			{ scope: 'occurrence' as const, thisAndAllFuture: false },
			{ scope: 'future' as const, thisAndAllFuture: true },
		])('calls createRecurrenceException with thisAndAllFuture=$thisAndAllFuture for scope "$scope"', async ({ scope, thisAndAllFuture }) => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(1000, 1000, 2000)
			// Same root on both sides - this test only cares about the createRecurrenceException call itself
			eventComponent.canCreateRecurrenceExceptions = vi.fn().mockReturnValue(true)
			eventComponent.createRecurrenceException = vi.fn().mockReturnValue([{ root: 'same-root' }, { root: 'same-root' }])
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.saveCalendarObjectInstance({
				scope,
				calendarId: 'calendar-1',
			})

			expect(eventComponent.createRecurrenceException).toHaveBeenCalledWith(thisAndAllFuture)
		})

		it('creates a new calendar-object from the fork when its root differs from the original (future truncate-and-fork)', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(1000, 1000, 2000)
			const originalItem = { root: 'master-root' }
			const forkItem = { root: 'fork-root' }
			eventComponent.canCreateRecurrenceExceptions = vi.fn().mockReturnValue(true)
			eventComponent.createRecurrenceException = vi.fn().mockReturnValue([originalItem, forkItem])
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'createCalendarObjectFromFork').mockResolvedValue()

			await store.saveCalendarObjectInstance({
				scope: 'future',
				calendarId: 'calendar-1',
			})

			expect(calendarObjectsStore.createCalendarObjectFromFork).toHaveBeenCalledWith({
				eventComponent: forkItem,
				calendarId: 'calendar-1',
			})
		})

		it('does not create a new calendar-object when the fork shares the original\'s root (in-place occurrence exception)', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(1000, 1000, 2000)
			const sharedRootItem = { root: 'shared-root' }
			const otherSharedRootItem = { root: 'shared-root' }
			eventComponent.canCreateRecurrenceExceptions = vi.fn().mockReturnValue(true)
			eventComponent.createRecurrenceException = vi.fn().mockReturnValue([sharedRootItem, otherSharedRootItem])
			const calendarObject = {
				calendarId: 'calendar-1',
				calendarComponent: {
					getComponentIterator: vi.fn().mockReturnValue([]),
				},
			}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'createCalendarObjectFromFork').mockResolvedValue()

			await store.saveCalendarObjectInstance({
				scope: 'occurrence',
				calendarId: 'calendar-1',
			})

			expect(calendarObjectsStore.createCalendarObjectFromFork).not.toHaveBeenCalled()
		})

		it('creates a real recurrence-exception in the same document when saving an edited nth occurrence with occurrence scope (real calendar-js)', async () => {
			const ics = [
				'BEGIN:VCALENDAR',
				'VERSION:2.0',
				'PRODID:-//Nextcloud//calendar-js tests//EN',
				'BEGIN:VEVENT',
				'UID:nth-occurrence-create-test',
				'DTSTART:20260907T100000Z',
				'DTEND:20260907T110000Z',
				'DTSTAMP:20260901T000000Z',
				'SUMMARY:Original title',
				'RRULE:FREQ=WEEKLY;COUNT=5',
				'END:VEVENT',
				'END:VCALENDAR',
			].join('\r\n')

			const parser = getParserManager().getParserForFileType('text/calendar')
			parser.parse(ics)
			const calendarComponent = parser.getItemIterator().next().value

			let masterComponent = null
			for (const component of calendarComponent.getComponentIterator()) {
				if (component.name === 'VEVENT' && !component.hasProperty('RECURRENCE-ID')) {
					masterComponent = component
				}
			}
			const rangeEnd = masterComponent.startDate.clone()
			rangeEnd.year += 1
			// The 2nd occurrence - not the primary
			const secondOccurrence = masterComponent.recurrenceManager.getAllOccurrencesBetween(masterComponent.startDate, rangeEnd)[1]
			const secondOccurrenceRecurrenceId = secondOccurrence.getReferenceRecurrenceId()

			secondOccurrence.updatePropertyWithValue('SUMMARY', 'Edited title')
			secondOccurrence.markDirty()

			const calendarObject = { calendarId: 'personal', calendarComponent }

			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent: markRaw(secondOccurrence) }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'createCalendarObjectFromFork').mockResolvedValue()

			await store.saveCalendarObjectInstance({
				scope: 'occurrence',
				calendarId: 'personal',
			})

			// The master is untouched, and a brand new exception now lives in the same document
			let exceptionComponent = null
			let componentCount = 0
			for (const component of calendarComponent.getComponentIterator()) {
				componentCount++
				if (component.hasProperty('RECURRENCE-ID')) {
					exceptionComponent = component
				}
			}
			expect(componentCount).toBe(2)
			expect(exceptionComponent).not.toBeNull()
			expect(exceptionComponent.getFirstPropertyFirstValue('SUMMARY')).toBe('Edited title')
			expect(exceptionComponent.getFirstPropertyFirstValue('RECURRENCE-ID').compare(secondOccurrenceRecurrenceId)).toBe(0)
			expect(calendarObjectsStore.createCalendarObjectFromFork).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
		})
	})

	describe('deleteCalendarObjectInstance', () => {
		/**
		 * @param isPartOfRecurrenceSet Whether eventComponent belongs to a recurring series
		 */
		function setUpEventComponent(isPartOfRecurrenceSet: boolean) {
			return {
				isPartOfRecurrenceSet: vi.fn().mockReturnValue(isPartOfRecurrenceSet),
				removeThisOccurrence: vi.fn().mockReturnValue(false),
			}
		}

		it('deletes the whole calendar-object for a non-recurring event', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(false)
			const calendarObject = {}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'deleteCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.deleteCalendarObjectInstance({ scope: 'occurrence' })

			expect(calendarObjectsStore.deleteCalendarObject).toHaveBeenCalledWith({ calendarObject })
			expect(eventComponent.removeThisOccurrence).not.toHaveBeenCalled()
			expect(calendarObjectsStore.updateCalendarObject).not.toHaveBeenCalled()
		})

		it('deletes the whole calendar-object when scope is "series", even for a recurring event', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(true)
			const calendarObject = {}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'deleteCalendarObject').mockResolvedValue()

			await store.deleteCalendarObjectInstance({ scope: 'series' })

			expect(calendarObjectsStore.deleteCalendarObject).toHaveBeenCalledWith({ calendarObject })
			expect(eventComponent.removeThisOccurrence).not.toHaveBeenCalled()
		})

		it('removes only the single occurrence when deleting an existing recurrence exception', async () => {
			// Regression test for a real bug: isRecurring() only checks whether the
			// component itself carries RRULE/RDATE. A recurrence-exception's own VEVENT
			// never does (only the master does), so isRecurring() was always false for
			// an exception - which made the "singleton event" guard fire for
			// scope: 'occurrence' too, deleting the entire calendar-object instead of
			// just that occurrence. isPartOfRecurrenceSet() resolves through to the
			// master and is unaffected by which component (master, generated occurrence,
			// or exception) eventComponent actually is.
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(true)
			const calendarObject = {}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'deleteCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.deleteCalendarObjectInstance({ scope: 'occurrence' })

			expect(eventComponent.removeThisOccurrence).toHaveBeenCalledWith(false)
			expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledWith({ calendarObject })
			expect(calendarObjectsStore.deleteCalendarObject).not.toHaveBeenCalled()
		})

		it('passes thisAndAllFuture=true to removeThisOccurrence when scope is "future"', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(true)
			store.calendarObject = {}
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.deleteCalendarObjectInstance({ scope: 'future' })

			expect(eventComponent.removeThisOccurrence).toHaveBeenCalledWith(true)
		})

		it('deletes the whole calendar-object when removing the last remaining occurrence empties the recurrence set', async () => {
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(true)
			eventComponent.removeThisOccurrence.mockReturnValue(true)
			const calendarObject = {}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'deleteCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()

			await store.deleteCalendarObjectInstance({ scope: 'occurrence' })

			expect(calendarObjectsStore.deleteCalendarObject).toHaveBeenCalledWith({ calendarObject })
			expect(calendarObjectsStore.updateCalendarObject).not.toHaveBeenCalled()
		})

		it.each(['occurrence', 'future'] as const)('refuses to delete %s scope from the primary occurrence of a series', async (scope) => {
			// canDelete() in EditorMixin already restricts the primary occurrence to
			// "series" only in the UI, mirroring canUpdate()'s rule for
			// saveCalendarObjectInstance - this is the backend-side enforcement of
			// that same rule, so a caller that bypasses the UI can't delete just one
			// occurrence (or truncate the series) starting from the primary occurrence.
			const store = useCalendarObjectInstanceStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = setUpEventComponent(true)
			const calendarObject = {}
			store.calendarObject = calendarObject
			store.calendarObjectInstance = { eventComponent }
			vi.spyOn(calendarObjectsStore, 'deleteCalendarObject').mockResolvedValue()
			vi.spyOn(calendarObjectsStore, 'updateCalendarObject').mockResolvedValue()
			mockedisBaseOccurrence.mockReturnValue(true)

			await store.deleteCalendarObjectInstance({ scope })

			expect(eventComponent.removeThisOccurrence).not.toHaveBeenCalled()
			expect(calendarObjectsStore.deleteCalendarObject).not.toHaveBeenCalled()
		})
	})
})
