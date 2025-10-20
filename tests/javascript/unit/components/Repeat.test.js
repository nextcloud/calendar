/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import Repeat from '@/components/Editor/Repeat/Repeat.vue'

describe('components/Editor/Repeat/Repeat', () => {
	it.each([
		[false, [['requireFutureUpdate']]],
		[true, []],
	])('requires a future update only outside the master item', (isEditingBaseInstance , expectedCalls) => {
		const $emit = vi.fn()
		const vm = {
			$emit,
			isEditingBaseInstance ,
			recurrenceRule: { isUnsupported: false },
			calendarObjectInstanceStore: {
				calendarObjectInstance: {
					canModifyAllDay: false,
					eventComponent: {
						canModifyAllDay: vi.fn().mockReturnValue(true),
					},
				},
			},
		}

		Repeat.methods.modified.call(vm)

		expect($emit.mock.calls).toEqual(expectedCalls)
	})
})
