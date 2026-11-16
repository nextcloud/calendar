/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtension, EventEditorExtensionContext } from '@nextcloud/calendar'
import type { EventEditorExtensionState } from '@/store/eventEditorExtensionInstances'

import { registerEventEditorExtension } from '@nextcloud/calendar'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import useEventEditorExtensionInstancesStore from '@/store/eventEditorExtensionInstances'
import logger from '@/utils/logger.js'

vi.mock('@/utils/logger.js', () => ({
	default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

let pinia: ReturnType<typeof createPinia>
let registrations: ReturnType<typeof registerEventEditorExtension>[]

/**
 * Register an extension whose setup records its context and the order of calls.
 *
 * @param name - Name of the extension
 * @param setup - Setup of the extension
 */
function register(name: string, setup: (ctx: EventEditorExtensionContext) => void = () => {}) {
	const extension = {
		app: 'test',
		name,
		setup: vi.fn(setup),
	} satisfies EventEditorExtension
	registrations.push(registerEventEditorExtension(extension as EventEditorExtension))
	return extension
}

/**
 * Create the state of an editor showing a new event.
 *
 * @param overrides - Properties to override
 */
function createState(overrides: Partial<EventEditorExtensionState> = {}): EventEditorExtensionState {
	return {
		calendarObject: { id: 'object-1', uid: 'uid-1', calendarId: 'calendar-1' },
		eventComponent: { updatePropertyWithValue: vi.fn() },
		access: 'full',
		view: 'simple',
		...overrides,
	}
}

/**
 * Get the context of the n-th setup of an extension.
 *
 * @param extension - The extension
 * @param call - Index of the setup call
 */
function contextOf(extension: ReturnType<typeof register>, call = 0): EventEditorExtensionContext {
	return extension.setup.mock.calls[call][0]
}

/**
 * Add a field to the editor through the context of an extension.
 *
 * @param ctx - Context of the extension
 */
function addField(ctx: EventEditorExtensionContext): HTMLElement {
	const field = document.createElement('div')
	ctx.editor.addField({ field })
	return field
}

describe('store/eventEditorExtensionInstances', () => {
	beforeEach(() => {
		pinia = createPinia()
		setActivePinia(pinia)
		registrations = []
		vi.clearAllMocks()
	})

	afterEach(() => {
		// Stop the stores first, so they do not react to the extensions being unregistered.
		pinia._e.stop()
		for (const registration of registrations) {
			registration.unregister()
		}
	})

	describe('opening and closing the editor', () => {
		it('sets up the registered extensions in registration order when the editor is opened', () => {
			const first = register('first')
			const second = register('second')
			const store = useEventEditorExtensionInstancesStore()

			store.setEventEditorState(createState())

			expect(first.setup).toHaveBeenCalledOnce()
			expect(second.setup).toHaveBeenCalledOnce()
			expect(first.setup).toHaveBeenCalledBefore(second.setup)
		})

		it('does not set up extensions while no editor is open', () => {
			const extension = register('extension')
			useEventEditorExtensionInstancesStore()

			expect(extension.setup).not.toHaveBeenCalled()
		})

		it('disposes the extensions when the editor is closed', () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())
			const ctx = contextOf(extension)
			addField(ctx)
			const onSave = vi.fn()
			ctx.event.onSave({ callback: onSave })

			store.setEventEditorState(null)

			expect(store.fields).toEqual([])
			store.notifyBeforeSave()
			expect(onSave).not.toHaveBeenCalled()
			// A disposed instance ignores late calls, e.g. of an async setup.
			addField(ctx)
			expect(store.fields).toEqual([])
		})

		it('lists the fields of all extensions in the order they were set up', () => {
			const first = register('first')
			const second = register('second')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())

			const secondField = addField(contextOf(second))
			const firstField = addField(contextOf(first))

			expect(store.fields.map(({ field }) => field)).toEqual([firstField, secondField])
		})
	})

	describe('changing the state of the open editor', () => {
		it('sets up the extensions again when another event is opened', () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())
			const onSave = vi.fn()
			contextOf(extension).event.onSave({ callback: onSave })

			store.setEventEditorState(createState())

			expect(extension.setup).toHaveBeenCalledTimes(2)
			store.notifyBeforeSave()
			expect(onSave).not.toHaveBeenCalled()
		})

		it('sets up the extensions again when another occurrence of the same calendar object is opened', () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			const state = createState()
			store.setEventEditorState(state)

			store.setEventEditorState(createState({ calendarObject: state.calendarObject }))

			expect(extension.setup).toHaveBeenCalledTimes(2)
		})

		it('keeps the extensions while the same event stays open', () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			const state = createState()
			store.setEventEditorState(state)
			const field = addField(contextOf(extension))

			// The editor changes the calendar object in place, e.g. a new event gets its id when it is saved.
			state.calendarObject.id = 'object-2'
			store.setEventEditorState({ ...state })

			expect(extension.setup).toHaveBeenCalledOnce()
			expect(store.fields.map((f) => f.field)).toEqual([field])
		})

		it('keeps the extensions and notifies them when the view changes', () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			const state = createState()
			store.setEventEditorState(state)
			const ctx = contextOf(extension)
			const onViewChange = vi.fn()
			ctx.editor.onViewChange({ callback: onViewChange })

			store.setEventEditorState({ ...state, view: 'full' })

			expect(extension.setup).toHaveBeenCalledOnce()
			expect(onViewChange).toHaveBeenCalledExactlyOnceWith({ view: 'full' })
			expect(ctx.editor.view).toBe('full')
		})

		it('does not notify the extensions when the view stays the same', () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			const state = createState()
			store.setEventEditorState(state)
			const onViewChange = vi.fn()
			contextOf(extension).editor.onViewChange({ callback: onViewChange })

			store.setEventEditorState({ ...state })

			expect(onViewChange).not.toHaveBeenCalled()
		})

		it('logs an error and sets up the extensions again when the access changes', () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			const state = createState({ access: 'full' })
			store.setEventEditorState(state)

			store.setEventEditorState({ ...state, access: 'view' })

			expect(logger.error).toHaveBeenCalledExactlyOnceWith('Unexpected behavior: the access to the open event changed. Please report this as a bug.', {
				previousAccess: 'full',
				access: 'view',
			})
			expect(extension.setup).toHaveBeenCalledTimes(2)
			expect(contextOf(extension, 1).editor.access).toBe('view')
		})
	})

	describe('registering and unregistering extensions', () => {
		it('sets up an extension registered while the editor is open', async () => {
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())

			const extension = register('extension')
			await nextTick()

			expect(extension.setup).toHaveBeenCalledOnce()
		})

		it('does not set up an extension registered while no editor is open', async () => {
			useEventEditorExtensionInstancesStore()

			const extension = register('extension')
			await nextTick()

			expect(extension.setup).not.toHaveBeenCalled()
		})

		it('disposes an extension unregistered while the editor is open', async () => {
			const extension = register('extension')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())
			addField(contextOf(extension))
			expect(store.fields).toHaveLength(1)

			registrations[0].unregister()
			await nextTick()

			expect(store.fields).toEqual([])
		})

		it('keeps the other extensions when one is registered, and lists its fields in registration order', async () => {
			const first = register('first')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())
			const firstField = addField(contextOf(first))

			const second = register('second')
			await nextTick()
			const secondField = addField(contextOf(second))

			expect(first.setup).toHaveBeenCalledOnce()
			expect(second.setup).toHaveBeenCalledOnce()
			expect(store.fields.map(({ field }) => field)).toEqual([firstField, secondField])
		})

		it('keeps the other extensions when one is unregistered', async () => {
			const first = register('first')
			const second = register('second')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())
			const firstField = addField(contextOf(first))
			addField(contextOf(second))

			registrations[1].unregister()
			await nextTick()

			expect(first.setup).toHaveBeenCalledOnce()
			expect(store.fields.map(({ field }) => field)).toEqual([firstField])
		})
	})

	describe('notifying before save', () => {
		it('calls the save callbacks of all extensions', () => {
			const first = register('first')
			const second = register('second')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())
			const firstOnSave = vi.fn()
			const secondOnSave = vi.fn()
			contextOf(first).event.onSave({ callback: firstOnSave })
			contextOf(second).event.onSave({ callback: secondOnSave })

			store.notifyBeforeSave()

			expect(firstOnSave).toHaveBeenCalledExactlyOnceWith()
			expect(secondOnSave).toHaveBeenCalledExactlyOnceWith()
			expect(firstOnSave).toHaveBeenCalledBefore(secondOnSave)
		})
	})

	describe('errors of extensions', () => {
		it('logs an error thrown by a setup and still sets up the other extensions', () => {
			const error = new Error('setup failed')
			register('broken', () => {
				throw error
			})
			const other = register('other')
			const store = useEventEditorExtensionInstancesStore()

			expect(() => store.setEventEditorState(createState())).not.toThrow()

			expect(other.setup).toHaveBeenCalledOnce()
			expect(logger.error).toHaveBeenCalledExactlyOnceWith('Event editor extension `broken` of app `test` failed in `setup`', { error })
		})

		it('logs an error thrown by a save callback and still calls the other callbacks', () => {
			const broken = register('broken')
			const other = register('other')
			const store = useEventEditorExtensionInstancesStore()
			store.setEventEditorState(createState())
			const error = new Error('save failed')
			contextOf(broken).event.onSave({
				callback: () => {
					throw error
				},
			})
			const otherOnSave = vi.fn()
			contextOf(other).event.onSave({ callback: otherOnSave })

			expect(() => store.notifyBeforeSave()).not.toThrow()

			expect(otherOnSave).toHaveBeenCalledOnce()
			expect(logger.error).toHaveBeenCalledExactlyOnceWith('Event editor extension `broken` of app `test` failed in `onSave`', { error })
		})

		it('logs an error thrown by a view change callback and still calls the other callbacks', () => {
			const broken = register('broken')
			const other = register('other')
			const store = useEventEditorExtensionInstancesStore()
			const state = createState()
			store.setEventEditorState(state)
			const error = new Error('view change failed')
			contextOf(broken).editor.onViewChange({
				callback: () => {
					throw error
				},
			})
			const otherOnViewChange = vi.fn()
			contextOf(other).editor.onViewChange({ callback: otherOnViewChange })

			expect(() => store.setEventEditorState({ ...state, view: 'full' })).not.toThrow()

			expect(otherOnViewChange).toHaveBeenCalledExactlyOnceWith({ view: 'full' })
			expect(logger.error).toHaveBeenCalledExactlyOnceWith('Event editor extension `broken` of app `test` failed in `onViewChange`', { error })
		})
	})
})
