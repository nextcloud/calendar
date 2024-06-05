/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translatePlural } from '@nextcloud/l10n'
import eventLimitText from "../../../../../src/fullcalendar/rendering/eventLimitText.js";
jest.mock('@nextcloud/l10n')

describe('fullcalendar/eventSourceFunction test suite', () => {

	beforeEach(() => {
		translatePlural.mockClear()

		translatePlural
			.mockImplementation((app, sinStr, pluStr) => pluStr)
	})

	it('should provide a string for event-limit', () => {
		expect(eventLimitText({ num: 1 })).toEqual('+%n more')
		expect(eventLimitText({ num: 42 })).toEqual('+%n more')

		expect(translatePlural).toHaveBeenCalledTimes(2)
		expect(translatePlural).toHaveBeenNthCalledWith(1, 'calendar', '+%n more', '+%n more', 1)
		expect(translatePlural).toHaveBeenNthCalledWith(2, 'calendar', '+%n more', '+%n more', 42)
	})
})
