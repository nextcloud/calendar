/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { setActivePinia, createPinia } from 'pinia'
import { toRaw } from 'vue'
import useCalendarObjectsStore from '../../../../src/store/calendarObjects.js'

describe('store/calendarObjects test suite', () => {

	beforeEach(() => {
		setActivePinia(createPinia())
	})

	describe('appendOrUpdateCalendarObjectsMutation', () => {
		const makeObject = (id, etag, tag) => ({
			id,
			dav: { etag },
			calendarComponent: {},
			_tag: tag,
		})

		it('appends a calendar-object that is not in the store yet', () => {
			const store = useCalendarObjectsStore()
			const obj = makeObject('a', '"v1"', 'first')

			store.appendOrUpdateCalendarObjectsMutation({ calendarObjects: [obj] })

			expect(store.calendarObjects.a._tag).toBe('first')
			expect(toRaw(store.calendarObjects.a)).toBe(obj)
		})

		it('keeps the existing instance when the ETag is unchanged (no detach)', () => {
			const store = useCalendarObjectsStore()
			const original = makeObject('a', '"v1"', 'original')
			store.appendOrUpdateCalendarObjectsMutation({ calendarObjects: [original] })

			const incoming = makeObject('a', '"v1"', 'incoming')
			store.appendOrUpdateCalendarObjectsMutation({ calendarObjects: [incoming] })

			// Identity must be preserved: the original instance is kept so references
			// held elsewhere (e.g. the open editor) stay attached. See #8367.
			expect(store.calendarObjects.a._tag).toBe('original')
			expect(toRaw(store.calendarObjects.a)).toBe(original)
		})

		it('replaces the instance when the ETag changed', () => {
			const store = useCalendarObjectsStore()
			const original = makeObject('a', '"v1"', 'original')
			store.appendOrUpdateCalendarObjectsMutation({ calendarObjects: [original] })

			const incoming = makeObject('a', '"v2"', 'updated')
			store.appendOrUpdateCalendarObjectsMutation({ calendarObjects: [incoming] })

			expect(store.calendarObjects.a._tag).toBe('updated')
			expect(toRaw(store.calendarObjects.a)).toBe(incoming)
		})
	})

})
