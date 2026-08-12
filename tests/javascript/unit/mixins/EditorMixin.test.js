/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import EditorMixin from '../../../../src/mixins/EditorMixin.js'
import { ViewMode } from '../../../../src/utils/router.js'

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
