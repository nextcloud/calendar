/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import EditCalendarModal from '@/components/AppNavigation/EditCalendarModal.vue'

describe('components/AppNavigation/EditCalendarModal', () => {
	/**
	 * Evaluate canChangeTransparency for the given calendar.
	 *
	 * @param {object} calendar Calendar properties
	 * @param {object} dav Properties as reported by the server
	 * @return {boolean}
	 */
	function canChangeTransparency(calendar, dav = { transparency: 'opaque' }) {
		const vm = {
			calendar: {
				isSharedWithMe: false,
				readOnly: false,
				dav,
				...calendar,
			},
		}
		return EditCalendarModal.computed.canChangeTransparency.call(vm)
	}

	it('allows changing the transparency of own calendars', () => {
		expect(canChangeTransparency({})).toBe(true)
		expect(canChangeTransparency({}, {})).toBe(true)
	})

	it('allows changing the transparency of own read-only calendars when the server reports it', () => {
		expect(canChangeTransparency({ readOnly: true }, { transparency: 'opaque' })).toBe(true)
		expect(canChangeTransparency({ readOnly: true }, { transparency: 'transparent' })).toBe(true)
	})

	it('does not allow changing the transparency of own read-only calendars when the server does not report it', () => {
		expect(canChangeTransparency({ readOnly: true }, {})).toBe(false)
	})

	it('does not allow changing the transparency of calendars shared with the user', () => {
		expect(canChangeTransparency({ isSharedWithMe: true })).toBe(false)
		expect(canChangeTransparency({ isSharedWithMe: true, readOnly: true })).toBe(false)
	})
})
