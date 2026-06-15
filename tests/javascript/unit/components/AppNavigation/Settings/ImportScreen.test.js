/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { translatePlural } from '@nextcloud/l10n'
import ImportScreen from '@/components/AppNavigation/Settings/ImportScreen.vue'

describe('components/AppNavigation/Settings/ImportScreen', () => {
	/**
	 * Compute the status line for the given counters.
	 *
	 * @param {object} overrides Counters to override
	 * @return {string} The status line
	 */
	function getStatusLine(overrides = {}) {
		const vm = {
			$n: translatePlural,
			totals: {
				discovered: 0,
				processed: 0,
				created: 0,
				updated: 0,
				exists: 0,
				error: 0,
				...overrides,
			},
		}
		return ImportScreen.computed.statusLine.call(vm)
	}

	it('is empty when nothing was discovered yet', () => {
		expect(getStatusLine()).toBe('')
	})

	it('shows the progress even when nothing was processed yet', () => {
		expect(getStatusLine({ discovered: 100 })).toBe('Processing 0 of 100')
	})

	it('lists only the counters that are not zero', () => {
		expect(getStatusLine({ discovered: 100, processed: 30, created: 25, updated: 5 }))
			.toBe('Processing 30 of 100, Created 25, Updated 5')
	})

	it('lists all counters when none are zero', () => {
		expect(getStatusLine({ discovered: 10, processed: 10, created: 4, updated: 3, exists: 2, error: 1 }))
			.toBe('Processing 10 of 10, Created 4, Updated 3, Skipped 2, Failed 1')
	})
})
