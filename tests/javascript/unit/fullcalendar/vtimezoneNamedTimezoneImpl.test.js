/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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

import {
	createPlugin,
} from '@fullcalendar/core'
import getTimezoneManager from '../../../../src/services/timezoneDataProviderService.js'
jest.mock('../../../../src/services/timezoneDataProviderService.js')
jest.mock('@fullcalendar/core')

import vtimezoneNamedTimezoneImpl from "../../../../src/fullcalendar/vtimezoneNamedTimezoneImpl.js";

describe('fullcalendar/vtimezoneNamedTimezoneImpl test suite', () => {

	beforeEach(() => {
		getTimezoneManager.mockClear()
	})

	it('should properly register a plugin for full-calendar', () => {
		expect(createPlugin).toHaveBeenCalledTimes(1)
		expect(createPlugin).toHaveBeenNthCalledWith(1, {
			namedTimeZonedImpl: expect.any(Function)
		})
	})

	it('should properly implement the offsetForArray method', () => {
		const timezone = {
			calendarJsTimezone: true,
			tzid: 'America/New_York',
			offsetForArray: jest.fn().mockReturnValue(1337 * 60)
		}

		const getTimezoneForId = jest.fn()
			.mockReturnValue(timezone)

		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId
			})

		const VTimezoneNamedTimezone = createPlugin.mock.calls[0][0].namedTimeZonedImpl
		const instance = new VTimezoneNamedTimezone('America/New_York')

		const result = instance.offsetForArray([2019, 0, 1, 14, 30, 0])

		expect(result).toEqual(1337)

		expect(getTimezoneForId).toHaveBeenCalledTimes(1)
		expect(timezone.offsetForArray).toHaveBeenCalledTimes(1)
		expect(timezone.offsetForArray).toHaveBeenNthCalledWith(1, 2019, 1, 1, 14, 30, 0)
	})

	it('should properly implement the timestampToArray method', () => {
		const timezone = {
			calendarJsTimezone: true,
			tzid: 'America/New_York',
			timestampToArray: jest.fn().mockReturnValue([2019, 1, 1, 14, 30, 0])
		}

		const getTimezoneForId = jest.fn()
			.mockReturnValue(timezone)

		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId
			})

		const VTimezoneNamedTimezone = createPlugin.mock.calls[0][0].namedTimeZonedImpl
		const instance = new VTimezoneNamedTimezone('America/New_York')

		const result = instance.timestampToArray(1337)

		expect(result).toEqual([2019, 0, 1, 14, 30, 0])

		expect(getTimezoneForId).toHaveBeenCalledTimes(1)
		expect(timezone.timestampToArray).toHaveBeenCalledTimes(1)
		expect(timezone.timestampToArray).toHaveBeenNthCalledWith(1, 1337)
	})

})
