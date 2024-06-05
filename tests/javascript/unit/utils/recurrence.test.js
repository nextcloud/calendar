/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
