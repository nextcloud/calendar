/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import PropertyTitleTimePicker from '@/components/Editor/Properties/PropertyTitleTimePicker.vue'

describe('components/Editor/Properties/PropertyTitleTimePicker', () => {
	it('labels the time zone button with its purpose and the current time zone', () => {
		const $t = vi.fn((app, text, vars) => text.replace('{timezone}', vars.timezone))

		const label = PropertyTitleTimePicker.computed.timezoneButtonLabel.call({ $t, startTimezone: 'Europe/Berlin' })

		expect($t).toHaveBeenCalledWith('calendar', 'Change time zone (current: {timezone})', { timezone: 'Europe/Berlin' })
		expect(label).toBe('Change time zone (current: Europe/Berlin)')
	})
})
