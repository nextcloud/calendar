/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { translatePlural } from '@nextcloud/l10n'
import eventLimitText from "../../../../src/fullcalendar/eventLimitText.js";
jest.mock('@nextcloud/l10n')

describe('fullcalendar/eventSourceFunction test suite', () => {

	beforeEach(() => {
		translatePlural.mockClear()

		translatePlural
			.mockImplementation((app, sinStr, pluStr) => pluStr)
	})

	it('should provide a string for event-limit', () => {
		expect(eventLimitText(1)).toEqual('+%n more')
		expect(eventLimitText(42)).toEqual('+%n more')

		expect(translatePlural).toHaveBeenCalledTimes(2)
		expect(translatePlural).toHaveBeenNthCalledWith(1, 'calendar', '+%n more', '+%n more', 1)
		expect(translatePlural).toHaveBeenNthCalledWith(2, 'calendar', '+%n more', '+%n more', 42)
	})
})
