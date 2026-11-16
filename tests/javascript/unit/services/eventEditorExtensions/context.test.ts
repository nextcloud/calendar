/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtension } from '@nextcloud/calendar-integration'
import type { ExtensionInstance } from '@/services/eventEditorExtensions/instance'
import type { EventEditorEventAccess } from '@/store/eventEditorExtensionInstances'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import { createEventEditorExtensionContext } from '@/services/eventEditorExtensions/context'

let eventComponent: { updatePropertyWithValue: ReturnType<typeof vi.fn> }

/**
 * Create an instance of an extension and the context passed to its setup.
 *
 * @param access - Access of the user to the event
 */
function createContext(access: EventEditorEventAccess = 'full') {
	const instance: ExtensionInstance = {
		extension: { app: 'test', name: 'test', setup: () => {} } as EventEditorExtension,
		saveCallbacks: [],
		viewChangeCallbacks: [],
		view: 'simple',
		access,
		fields: shallowRef([]),
		isDisposed: false,
	}
	return { instance, context: createEventEditorExtensionContext(instance, eventComponent) }
}

// Extensions are plain JavaScript, so the tests pass values the types do not allow, cast with `as any`.

describe('services/eventEditorExtensions/context', () => {
	beforeEach(() => {
		eventComponent = { updatePropertyWithValue: vi.fn() }
	})

	describe('setProperty', () => {
		it.each(['X-MYAPP-EXAMPLE', 'x-myapp-example', 'X-NCX'])('sets the property `%s`', (name) => {
			const { context } = createContext()

			context.event.setProperty({ name, value: 'value' })

			expect(eventComponent.updatePropertyWithValue).toHaveBeenCalledExactlyOnceWith(name, 'value')
		})

		it.each(['SUMMARY', 'X-NC-EXAMPLE', 'x-nc-example'])('refuses to set the property `%s`', (name) => {
			const { context } = createContext()

			expect(() => context.event.setProperty({ name, value: 'value' })).toThrow(Error)
			expect(eventComponent.updatePropertyWithValue).not.toHaveBeenCalled()
		})

		it.each([undefined, 'X-MYAPP-EXAMPLE'])('throws if the property is `%s`', (property) => {
			const { context } = createContext()

			expect(() => context.event.setProperty(property as any)).toThrow(TypeError)
			expect(eventComponent.updatePropertyWithValue).not.toHaveBeenCalled()
		})

		it.each([
			{ name: 1, value: 'value' },
			{ name: 'X-MYAPP-EXAMPLE', value: undefined },
		])('throws if the name or value is not a string: %o', (property) => {
			const { context } = createContext()

			expect(() => context.event.setProperty(property as any)).toThrow(TypeError)
			expect(eventComponent.updatePropertyWithValue).not.toHaveBeenCalled()
		})

		it('throws if the user can only view the event', () => {
			const { context } = createContext('view')

			expect(() => context.event.setProperty({ name: 'X-MYAPP-EXAMPLE', value: 'value' })).toThrow(Error)
			expect(eventComponent.updatePropertyWithValue).not.toHaveBeenCalled()
		})
	})

	describe('addCustomField', () => {
		it('adds the field', () => {
			const { instance, context } = createContext()
			const field = document.createElement('div')

			context.editor.addCustomField({ element: field })

			expect(instance.fields.value).toMatchObject([{ element: field }])
		})

		it.each([
			undefined,
			{ element: 'element' },
		])('throws if the options are not valid: %o', (options) => {
			const { instance, context } = createContext()

			expect(() => context.editor.addCustomField(options as any)).toThrow(TypeError)
			expect(instance.fields.value).toEqual([])
		})
	})

	describe.each(['onSave', 'onViewChange'] as const)('%s', (method) => {
		it.each([undefined, { callback: 'callback' }])('throws if the options are not valid: %o', (options) => {
			const { instance, context } = createContext()
			const target: any = method === 'onSave' ? context.event : context.editor

			expect(() => target[method](options)).toThrow(TypeError)
			expect(instance.saveCallbacks).toEqual([])
			expect(instance.viewChangeCallbacks).toEqual([])
		})
	})
})
