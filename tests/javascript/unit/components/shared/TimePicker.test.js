/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import TimePicker from '@/components/Shared/TimePicker.vue'

describe('TimePicker', () => {
	it('displays provided date', async () => {
		const wrapper = mount(TimePicker, {
			props: {
				date: new Date('2026-07-11T09:00:00Z'),
			},
		})

		expect(wrapper.html()).toContain('09:00')
	})

	it('emits change', async () => {
		const wrapper = mount(TimePicker, {
			props: {
				date: new Date('2026-07-11T09:00:00Z'),
			},
		})

		const input = wrapper.get('input[type="time"]')
		await input.setValue('11:30')

		expect(wrapper.emitted('change')).toEqual([[new Date('2026-07-11T11:30:00Z')]])
	})

	it('does not emit change after inputing same time', async () => {
		const wrapper = mount(TimePicker, {
			props: {
				date: new Date('2026-07-11T09:00:00Z'),
			},
		})

		const input = wrapper.get('input[type="time"]')
		await input.setValue('')
		await input.setValue('09:00')

		expect(wrapper.html()).toContain('09:00')
		expect(wrapper.emitted('change')).toBeUndefined()
	})

	it('does cleared input without emmiting change', async () => {
		const wrapper = mount(TimePicker, {
			props: {
				date: new Date('2026-07-11T09:00:00Z'),
			},
		})

		const input = wrapper.get('input[type="time"]')
		await input.setValue('')

		expect(wrapper.html()).not.toContain('09:00')
		// We do not expect to see a change event for a cleared input.
		// A cleared input is just an intermediate state.
		expect(wrapper.emitted('change')).toBeUndefined()
	})

	it('resets cleared input after losing focus', async () => {
		const wrapper = mount(TimePicker, {
			attachTo: document.body,
			props: {
				date: new Date('2026-07-11T09:00:00Z'),
			},
		})
		const input = wrapper.get('input[type="time"]')
		input.element.focus()
		await input.setValue('')

		input.element.blur()
		await nextTick()

		expect(wrapper.html()).toContain('09:00')
		// We do not expect to see a change event for restoring a cleared input.
		// A cleared input was just an intermediate state.
		expect(wrapper.emitted('change')).toBeUndefined()
	})
})