/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import EditorMixin from '@/mixins/EditorMixin.js'
import { ViewMode } from '@/utils/router.js'

describe('mixins/EditorMixin test suite', () => {
	describe('viewMode', () => {
		it('is WIDGET whenever rendered as a widget, regardless of route', () => {
			const vm = { isWidget: true, $route: { name: 'PublicCalendarView' } }
			expect(EditorMixin.computed.viewMode.call(vm)).toEqual(ViewMode.WIDGET)
		})

		it('is derived from the route name otherwise', () => {
			expect(EditorMixin.computed.viewMode.call({ isWidget: false, $route: { name: 'PublicEditPopoverView' } })).toEqual(ViewMode.PUBLIC)
			expect(EditorMixin.computed.viewMode.call({ isWidget: false, $route: { name: 'EmbedEditFullView' } })).toEqual(ViewMode.EMBEDDED)
			expect(EditorMixin.computed.viewMode.call({ isWidget: false, $route: { name: 'EditPopoverView' } })).toEqual(ViewMode.USER)
		})
	})

	describe('canDuplicate', () => {
		it('is true only in USER mode', () => {
			expect(EditorMixin.computed.canDuplicate.call({ viewMode: ViewMode.USER })).toEqual(true)
			expect(EditorMixin.computed.canDuplicate.call({ viewMode: ViewMode.PUBLIC })).toEqual(false)
			expect(EditorMixin.computed.canDuplicate.call({ viewMode: ViewMode.EMBEDDED })).toEqual(false)
			expect(EditorMixin.computed.canDuplicate.call({ viewMode: ViewMode.WIDGET })).toEqual(false)
		})
	})

	describe('isRecurringInstance', () => {
		it.each([
			[false, false, false],
			[true, false, true],
			[false, true, true],
		])('returns the recurrence state for generated and exception instances', (canCreateRecurrenceException, isEditingExceptionInstance, expected) => {
			expect(EditorMixin.computed.isRecurringInstance.call({
				canCreateRecurrenceException,
				isEditingExceptionInstance,
			})).toBe(expected)
		})
	})

	describe('canDelete', () => {
		it.each([
			[{ calendarObject: null }, 'occurrence', false],
			[{ calendarObject: { existsOnServer: false } }, 'occurrence', false],
			[{ isReadOnly: true }, 'occurrence', false],
			[{ isLoading: true }, 'occurrence', false],
			[{ isRecurringInstance: false }, 'occurrence', true],
			[{ isRecurringInstance: false }, 'series', false],
			[{ isRecurringInstance: true }, 'occurrence', true],
			[{ isRecurringInstance: true }, 'future', true],
			[{ isRecurringInstance: true }, 'series', true],
			[{ isRecurringInstance: true, isViewedByAttendee: true }, 'occurrence', false],
			[{ isRecurringInstance: true, isViewedByAttendee: true }, 'future', false],
			[{ isRecurringInstance: true, isViewedByAttendee: true }, 'series', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isViewedByAttendee: true }, 'occurrence', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isViewedByAttendee: true }, 'future', false],
			// An existing exception has nothing of its own to delete "the rest of the series"
			// from - only "this occurrence" (the exception itself) applies here, regardless
			// of viewer role.
			[{ isRecurringInstance: true, isEditingExceptionInstance: true }, 'occurrence', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true }, 'future', false],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true }, 'series', false],
			// The primary occurrence IS the whole series - deleting "just this occurrence"
			// or "this and future" doesn't offer anything meaningfully different from
			// deleting "the whole series" here (for the organizer; an attendee's own
			// RSVP scope is unrelated and stays governed by isViewedByAttendee above).
			[{ isRecurringInstance: true, isEditingBaseInstance: true }, 'occurrence', false],
			[{ isRecurringInstance: true, isEditingBaseInstance: true }, 'future', false],
			[{ isRecurringInstance: true, isEditingBaseInstance: true }, 'series', true],
			// isEditingBaseInstance is purely position-based, so it can also be true for an
			// exception that happens to sit at the primary occurrence's own position - the
			// exception check must stay the sole authority there, not this one, so
			// "occurrence" (the only scope an exception allows) must not get blocked too.
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isEditingBaseInstance: true }, 'occurrence', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isEditingBaseInstance: true }, 'series', false],
		])('restricts deletion by availability, recurrence, and attendee state', (overrides, scope, expected) => {
			const vm = {
				calendarObject: { existsOnServer: true },
				isReadOnly: false,
				isLoading: false,
				isRecurringInstance: false,
				isEditingExceptionInstance: false,
				isEditingBaseInstance: false,
				isViewedByAttendee: false,
				...overrides,
			}
			expect(EditorMixin.methods.canDelete.call(vm, scope)).toBe(expected)
		})
	})

	describe('delete', () => {
		it('does not execute a disallowed deletion mode', async () => {
			const deleteCalendarObjectInstance = vi.fn()
			const vm = {
				calendarObject: {},
				canDelete: vi.fn().mockReturnValue(false),
				calendarObjectInstanceStore: { deleteCalendarObjectInstance },
				isLoading: false,
			}

			await EditorMixin.methods.delete.call(vm, 'occurrence')

			expect(deleteCalendarObjectInstance).not.toHaveBeenCalled()
			expect(vm.isLoading).toBe(false)
		})

		it('executes an allowed deletion mode', async () => {
			const deleteCalendarObjectInstance = vi.fn().mockResolvedValue()
			const vm = {
				calendarObject: {},
				canDelete: vi.fn().mockReturnValue(true),
				calendarObjectInstanceStore: { deleteCalendarObjectInstance },
				isLoading: false,
			}

			await EditorMixin.methods.delete.call(vm, 'series')

			expect(deleteCalendarObjectInstance).toHaveBeenCalledWith({ scope: 'series' })
			expect(vm.isLoading).toBe(false)
		})
	})

	describe('canUpdate', () => {
		it.each([
			[{ calendarObject: null }, 'occurrence', false],
			[{ calendarObject: { existsOnServer: false } }, 'occurrence', false],
			[{ isReadOnly: true }, 'occurrence', false],
			[{ isLoading: true }, 'occurrence', false],
			[{ isNew: true }, 'occurrence', true],
			[{ isNew: true }, 'series', false],
			[{ requiresFutureUpdate: true }, 'occurrence', false],
			[{ requiresFutureUpdate: true }, 'future', true],
			[{ isRecurringInstance: false }, 'occurrence', true],
			[{ isRecurringInstance: false }, 'series', false],
			[{ isRecurringInstance: true }, 'occurrence', true],
			[{ isRecurringInstance: true }, 'future', true],
			[{ isRecurringInstance: true }, 'series', true],
			[{ isRecurringInstance: true, isViewedByAttendee: true }, 'occurrence', false],
			[{ isRecurringInstance: true, isViewedByAttendee: true }, 'future', false],
			[{ isRecurringInstance: true, isViewedByAttendee: true }, 'series', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isViewedByAttendee: true }, 'occurrence', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isViewedByAttendee: true }, 'future', false],
			// An existing exception never carries its own RRULE/RDATE/EXDATE, so neither
			// "series" nor "future" (which also needs a recurrence rule to split off of)
			// is offered while editing one - regardless of viewer role.
			[{ isRecurringInstance: true, isEditingExceptionInstance: true }, 'occurrence', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true }, 'future', false],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true }, 'series', false],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isViewedByAttendee: true }, 'series', false],
			// The primary occurrence IS the whole series - "this occurrence" and "this and
			// future" aren't offered there, only "series" (for the organizer; an attendee's
			// own RSVP scope is unrelated and stays governed by isViewedByAttendee above).
			[{ isRecurringInstance: true, isEditingBaseInstance: true }, 'occurrence', false],
			[{ isRecurringInstance: true, isEditingBaseInstance: true }, 'future', false],
			[{ isRecurringInstance: true, isEditingBaseInstance: true }, 'series', true],
			// isEditingBaseInstance is purely position-based, so it can also be true for an
			// exception that happens to sit at the primary occurrence's own position - the
			// exception check must stay the sole authority there, not this one, so
			// "occurrence" (the only scope an exception allows) must not get blocked too.
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isEditingBaseInstance: true }, 'occurrence', true],
			[{ isRecurringInstance: true, isEditingExceptionInstance: true, isEditingBaseInstance: true }, 'series', false],
		])('restricts updates by availability, recurrence, and attendee state', (overrides, scope, expected) => {
			const vm = {
				calendarObject: { existsOnServer: true },
				isReadOnly: false,
				isLoading: false,
				isNew: false,
				requiresFutureUpdate: false,
				isRecurringInstance: false,
				isEditingExceptionInstance: false,
				isEditingBaseInstance: false,
				isViewedByAttendee: false,
				...overrides,
			}
			expect(EditorMixin.methods.canUpdate.call(vm, scope)).toBe(expected)
		})
	})

	describe('requireFutureUpdate', () => {
		it('marks future updates as required', () => {
			const vm = { requiresFutureUpdate: false }

			EditorMixin.methods.requireFutureUpdate.call(vm)

			expect(vm.requiresFutureUpdate).toBe(true)
		})
	})

	describe('created', () => {
		it('marks a new event as its own master item', async () => {
			const vm = {
				isWidget: false,
				isLoading: true,
				isEditingBaseInstance : false,
				calendarId: null,
				$route: { name: 'NewFullView', params: { allDay: '0', dtstart: '1000', dtend: '2000' } },
				settingsStore: { getResolvedTimezone: 'UTC' },
				calendarObjectInstanceStore: {
					getCalendarObjectInstanceForNewEvent: vi.fn().mockResolvedValue(),
				},
				loadingCalendars: vi.fn().mockResolvedValue(),
				addDelegatorAsAttendeeIfNeeded: vi.fn(),
				calendarObject: { calendarId: 'calendar-1' },
				selectedCalendar: {},
			}

			await EditorMixin.created.call(vm)

			// Without this, a recurrence-rule change on a brand new event is
			// wrongly treated as requiring a future-only update, which a new
			// event can never satisfy, silently blocking the save.
			expect(vm.isEditingBaseInstance ).toBe(true)
		})
	})

	describe('save', () => {
		it('does not execute a disallowed update scope', async () => {
			const saveCalendarObjectInstance = vi.fn()
			const vm = {
				calendarObject: {},
				requiresFutureUpdate: false,
				canUpdate: vi.fn().mockReturnValue(false),
				calendarObjectInstanceStore: { saveCalendarObjectInstance },
				isLoading: false,
				isSaving: false,
			}

			await EditorMixin.methods.save.call(vm, 'occurrence')

			expect(saveCalendarObjectInstance).not.toHaveBeenCalled()
			expect(vm.isLoading).toBe(false)
			expect(vm.isSaving).toBe(false)
		})

		it('executes an allowed update scope', async () => {
			const saveCalendarObjectInstance = vi.fn().mockResolvedValue()
			const vm = {
				calendarObject: {},
				calendarId: 'calendar-1',
				requiresFutureUpdate: false,
				canUpdate: vi.fn().mockReturnValue(true),
				calendarObjectInstanceStore: { saveCalendarObjectInstance },
				isLoading: false,
				isSaving: false,
			}

			await EditorMixin.methods.save.call(vm, 'series')

			expect(saveCalendarObjectInstance).toHaveBeenCalledWith({
				scope: 'series',
				calendarId: 'calendar-1',
			})
			expect(vm.isLoading).toBe(false)
			expect(vm.isSaving).toBe(false)
		})
	})

	describe('duplicateEvent', () => {
		it('does nothing when duplication is not allowed in the current view (e.g. public/embedded/widget)', async () => {
			const duplicateCalendarObjectInstance = vi.fn()
			const vm = {
				canDuplicate: false,
				calendarObjectInstanceStore: { duplicateCalendarObjectInstance },
			}

			await EditorMixin.methods.duplicateEvent.call(vm)

			expect(duplicateCalendarObjectInstance).not.toHaveBeenCalled()
		})

		it('duplicates into the current calendar when it is writable', async () => {
			const duplicateCalendarObjectInstance = vi.fn()
			const vm = {
				canDuplicate: true,
				isReadOnly: false,
				calendarObject: { calendarId: 'calendar-1' },
				calendarObjectInstanceStore: { duplicateCalendarObjectInstance },
				calendarsStore: { sortedCalendars: [] },
			}

			await EditorMixin.methods.duplicateEvent.call(vm)

			expect(duplicateCalendarObjectInstance).toHaveBeenCalledWith({ calendarId: 'calendar-1' })
		})

		it('falls back to the first writable calendar when the source calendar is read-only', async () => {
			const duplicateCalendarObjectInstance = vi.fn()
			const vm = {
				canDuplicate: true,
				isReadOnly: true,
				calendarObject: { calendarId: 'calendar-1' },
				calendarObjectInstanceStore: { duplicateCalendarObjectInstance },
				calendarsStore: { sortedCalendars: [{ id: 'calendar-2' }] },
			}

			await EditorMixin.methods.duplicateEvent.call(vm)

			expect(duplicateCalendarObjectInstance).toHaveBeenCalledWith({ calendarId: 'calendar-2' })
		})
	})

	describe('keyboardDuplicateEvent', () => {
		it('does not trigger a duplication when it is not allowed in the current view', () => {
			const duplicateEvent = vi.fn()
			const vm = {
				isNew: false,
				canCreateRecurrenceException: false,
				canDuplicate: false,
				duplicateEvent,
			}
			const event = { key: 'd', ctrlKey: true, preventDefault: vi.fn() }

			EditorMixin.methods.keyboardDuplicateEvent.call(vm, event)

			expect(duplicateEvent).not.toHaveBeenCalled()
		})

		it('triggers a duplication when allowed', () => {
			const duplicateEvent = vi.fn()
			const vm = {
				isNew: false,
				canCreateRecurrenceException: false,
				canDuplicate: true,
				duplicateEvent,
			}
			const event = { key: 'd', ctrlKey: true, preventDefault: vi.fn() }

			EditorMixin.methods.keyboardDuplicateEvent.call(vm, event)

			expect(duplicateEvent).toHaveBeenCalled()
		})
	})
})
