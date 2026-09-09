/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import EditorMixin from '@/mixins/EditorMixin.js'

describe('mixins/EditorMixin test suite', () => {

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

	describe('keyboardCloseEditor', () => {
		it('cancels the editor', () => {
			const cancel = vi.fn()
			EditorMixin.methods.keyboardCloseEditor.call({ cancel })

			expect(cancel).toHaveBeenCalledWith(false)
		})
	})

	describe('keyboardSaveEvent', () => {
		it('does not save when read-only or editing a recurrence exception', () => {
			const saveAndLeave = vi.fn()
			EditorMixin.methods.keyboardSaveEvent.call({ isRecurringInstance: false, canUpdate: () => false, saveAndLeave })
			EditorMixin.methods.keyboardSaveEvent.call({ isRecurringInstance: true, canUpdate: () => true, saveAndLeave })

			expect(saveAndLeave).not.toHaveBeenCalled()
		})

		it('saves when allowed', () => {
			const saveAndLeave = vi.fn()
			EditorMixin.methods.keyboardSaveEvent.call({ isRecurringInstance: false, canUpdate: () => true, saveAndLeave })

			expect(saveAndLeave).toHaveBeenCalledWith('occurrence')
		})
	})

	describe('keyboardDeleteEvent', () => {
		it('does not delete when not allowed or editing a recurrence exception', () => {
			const deleteAndLeave = vi.fn()
			EditorMixin.methods.keyboardDeleteEvent.call({ isRecurringInstance: false, canDelete: () => false, deleteAndLeave })
			EditorMixin.methods.keyboardDeleteEvent.call({ isRecurringInstance: true, canDelete: () => true, deleteAndLeave })

			expect(deleteAndLeave).not.toHaveBeenCalled()
		})

		it('deletes when allowed', () => {
			const deleteAndLeave = vi.fn()
			EditorMixin.methods.keyboardDeleteEvent.call({ isRecurringInstance: false, canDelete: () => true, deleteAndLeave })

			expect(deleteAndLeave).toHaveBeenCalledWith('occurrence')
		})
	})

	describe('keyboardDuplicateEvent', () => {
		it('does not trigger a duplication when it is not allowed in the current view', () => {
			const duplicateEvent = vi.fn()
			const vm = {
				isNew: false,
				canDuplicate: false,
				duplicateEvent,
			}

			EditorMixin.methods.keyboardDuplicateEvent.call(vm)

			expect(duplicateEvent).not.toHaveBeenCalled()
		})

		it('triggers a duplication when allowed', () => {
			const duplicateEvent = vi.fn()
			const vm = {
				isNew: false,
				canDuplicate: true,
				duplicateEvent,
			}

			EditorMixin.methods.keyboardDuplicateEvent.call(vm)

			expect(duplicateEvent).toHaveBeenCalled()
		})
	})

	describe('mounted/beforeUnmount hotkey wiring', () => {
		it('registers hotkeys on mount and removes them on unmount', () => {
			const duplicateEvent = vi.fn()
			const vm = {
				...EditorMixin.methods,
				isNew: false,
				canDuplicate: true,
				duplicateEvent,
				hotKeysRegister: [],
			}

			EditorMixin.mounted.call(vm)
			expect(vm.hotKeysRegister).toHaveLength(4)

			document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true }))
			expect(duplicateEvent).toHaveBeenCalledTimes(1)

			EditorMixin.beforeUnmount.call(vm)

			document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true }))
			expect(duplicateEvent).toHaveBeenCalledTimes(1)
		})
	})
})
