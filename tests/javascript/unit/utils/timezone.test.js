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
	getSortedTimezoneList,
	getReadableTimezoneName
} from '../../../../src/utils/timezone.js'
import { translate } from '@nextcloud/l10n'

jest.mock('@nextcloud/l10n')

describe('utils/timezone test suite', () => {

	beforeEach(() => {
		translate.mockClear()
	})

	it('should sort a timezone list', () => {
		translate
			.mockImplementation((app, str) => str)

		const sorted = getSortedTimezoneList([
			'Europe/Berlin',
			'Europe/Amsterdam',
			'Europe/Paris',
			'America/New_York',
			'America/Los_Angeles',
			'UTC',
			'Z',
			'GMT'
		], [{
			continent: 'FOO',
			label: 'ABC',
			timezoneId: 'id123'
		}, {
			continent: 'Global',
			label: 'DEF',
			timezoneId: 'id456'
		}])

		expect(sorted.length).toEqual(4)
		expect(sorted[0].continent).toEqual('America')
		expect(sorted[0].regions).toEqual([{
			cities: [],
			label: 'Los Angeles',
			timezoneId: 'America/Los_Angeles'
		}, {
			cities: [],
			label: 'New York',
			timezoneId: 'America/New_York'
		}])

		expect(sorted[1].continent).toEqual('Europe')
		expect(sorted[1].regions).toEqual([{
			cities: [],
			label: 'Amsterdam',
			timezoneId: 'Europe/Amsterdam'
		}, {
			cities: [],
			label: 'Berlin',
			timezoneId: 'Europe/Berlin'
		}, {
			cities: [],
			label: 'Paris',
			timezoneId: 'Europe/Paris'
		}])

		expect(sorted[2].continent).toEqual('FOO')
		expect(sorted[2].regions).toEqual([{
			cities: [],
			label: 'ABC',
			timezoneId: 'id123'
		}])

		expect(sorted[3].continent).toEqual('Global')
		expect(sorted[3].regions).toEqual([{
			cities: [],
			label: 'DEF',
			timezoneId: 'id456'
		}, {
			cities: [],
			label: 'GMT',
			timezoneId: 'GMT'
		}, {
			cities: [],
			label: 'UTC',
			timezoneId: 'UTC'
		}, {
			cities: [],
			label: 'Z',
			timezoneId: 'Z'
		}])

		expect(translate).toHaveBeenCalledTimes(3)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Global')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'Global')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'Global')
	})

	it ('should get a readable timezone name', () => {
		expect(getReadableTimezoneName('Europe/Berlin')).toEqual('Europe - Berlin')
		expect(getReadableTimezoneName('America/New_York')).toEqual('America - New York')
		expect(getReadableTimezoneName('America/St_Johns')).toEqual('America - St. Johns')
	})
})
