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
	getBySetPositionAndBySetFromDate,
	getWeekDayFromDate
} from '../../../../src/utils/recurrence.js'


describe('utils/recurrence test suite', () => {

	it('should get the BYSETPOS value for a date object', () => {
		expect(getBySetPositionAndBySetFromDate(new Date(2019, 0, 1))).toEqual({
			byDay: 'TU',
			bySetPosition: 1
		})
		expect(getBySetPositionAndBySetFromDate(new Date(2019, 0, 8))).toEqual({
			byDay: 'TU',
			bySetPosition: 2
		})
		expect(getBySetPositionAndBySetFromDate(new Date(2019, 0, 15))).toEqual({
			byDay: 'TU',
			bySetPosition: 3
		})
		expect(getBySetPositionAndBySetFromDate(new Date(2019, 0, 22))).toEqual({
			byDay: 'TU',
			bySetPosition: 4
		})
		expect(getBySetPositionAndBySetFromDate(new Date(2019, 0, 29))).toEqual({
			byDay: 'TU',
			bySetPosition: 5
		})
	})

	it('should get the weekday for a date object', () => {
		expect(getWeekDayFromDate(new Date(2019, 0, 1))).toEqual('TU')
		expect(getWeekDayFromDate(new Date(2019, 0, 2))).toEqual('WE')
		expect(getWeekDayFromDate(new Date(2019, 0, 3))).toEqual('TH')
		expect(getWeekDayFromDate(new Date(2019, 0, 4))).toEqual('FR')
		expect(getWeekDayFromDate(new Date(2019, 0, 5))).toEqual('SA')
		expect(getWeekDayFromDate(new Date(2019, 0, 6))).toEqual('SU')
		expect(getWeekDayFromDate(new Date(2019, 0, 7))).toEqual('MO')

		expect(() => {
			getWeekDayFromDate({
				getDay: () => 99
			})
		}).toThrow(TypeError)
	})
})
