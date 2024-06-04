/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// TODO - fix me later
// import {
// 	createPlugin,
// } from '@fullcalendar/core'
// import getTimezoneManager from '../../../../../src/services/timezoneDataProviderService.js'
// import '../../../../../src/fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'
// jest.mock('../../../../../src/services/timezoneDataProviderService.js')
// jest.mock('@fullcalendar/core')
//
//
// describe('fullcalendar/vtimezoneNamedTimezoneImpl test suite', () => {
//
// 	beforeEach(() => {
// 		getTimezoneManager.mockClear()
// 	})
//
// 	it('should properly register a plugin for full-calendar', () => {
// 		expect(createPlugin).toHaveBeenCalledTimes(1)
// 		expect(createPlugin).toHaveBeenNthCalledWith(1, {
// 			namedTimeZonedImpl: expect.any(Function)
// 		})
// 	})
//
// 	it('should properly implement the offsetForArray method', () => {
// 		const timezone = {
// 			calendarJsTimezone: true,
// 			tzid: 'America/New_York',
// 			offsetForArray: jest.fn().mockReturnValue(1337 * 60)
// 		}
//
// 		const getTimezoneForId = jest.fn()
// 			.mockReturnValue(timezone)
//
// 		getTimezoneManager
// 			.mockReturnValue({
// 				getTimezoneForId
// 			})
//
// 		const VTimezoneNamedTimezone = createPlugin.mock.calls[0][0].namedTimeZonedImpl
// 		const instance = new VTimezoneNamedTimezone('America/New_York')
// 		instance.timeZoneName = 'America/New_York'
//
// 		const result = instance.offsetForArray([2019, 0, 1, 14, 30, 0])
//
// 		expect(result).toEqual(1337)
//
// 		expect(getTimezoneForId).toHaveBeenCalledTimes(1)
// 		expect(getTimezoneForId).toHaveBeenNthCalledWith(1, 'America/New_York')
// 		expect(timezone.offsetForArray).toHaveBeenCalledTimes(1)
// 		expect(timezone.offsetForArray).toHaveBeenNthCalledWith(1, 2019, 1, 1, 14, 30, 0)
// 	})
//
// 	it('should properly implement the offsetForArray method - unknown timezone', () => {
// 		const timezone = {
// 			calendarJsTimezone: true,
// 			tzid: 'UTC',
// 			offsetForArray: jest.fn().mockReturnValue(1337 * 60)
// 		}
//
// 		const getTimezoneForId = jest.fn()
// 			.mockReturnValueOnce(null)
// 			.mockReturnValue(timezone)
//
// 		getTimezoneManager
// 			.mockReturnValue({
// 				getTimezoneForId
// 			})
//
// 		const VTimezoneNamedTimezone = createPlugin.mock.calls[0][0].namedTimeZonedImpl
// 		const instance = new VTimezoneNamedTimezone('America/New_York')
// 		instance.timeZoneName = 'America/New_York'
//
// 		const result = instance.offsetForArray([2019, 0, 1, 14, 30, 0])
//
// 		expect(result).toEqual(1337)
//
// 		expect(getTimezoneForId).toHaveBeenCalledTimes(2)
// 		expect(getTimezoneForId).toHaveBeenNthCalledWith(1, 'America/New_York')
// 		expect(getTimezoneForId).toHaveBeenNthCalledWith(2, 'UTC')
// 		expect(timezone.offsetForArray).toHaveBeenCalledTimes(1)
// 		expect(timezone.offsetForArray).toHaveBeenNthCalledWith(1, 2019, 1, 1, 14, 30, 0)
// 	})
//
// 	it('should properly implement the timestampToArray method', () => {
// 		const timezone = {
// 			calendarJsTimezone: true,
// 			tzid: 'America/New_York',
// 			timestampToArray: jest.fn().mockReturnValue([2019, 1, 1, 14, 30, 0])
// 		}
//
// 		const getTimezoneForId = jest.fn()
// 			.mockReturnValue(timezone)
//
// 		getTimezoneManager
// 			.mockReturnValue({
// 				getTimezoneForId
// 			})
//
// 		const VTimezoneNamedTimezone = createPlugin.mock.calls[0][0].namedTimeZonedImpl
// 		const instance = new VTimezoneNamedTimezone('America/New_York')
// 		instance.timeZoneName = 'America/New_York'
//
// 		const result = instance.timestampToArray(1337)
//
// 		expect(result).toEqual([2019, 0, 1, 14, 30, 0])
//
// 		expect(getTimezoneForId).toHaveBeenCalledTimes(1)
// 		expect(getTimezoneForId).toHaveBeenNthCalledWith(1, 'America/New_York')
// 		expect(timezone.timestampToArray).toHaveBeenCalledTimes(1)
// 		expect(timezone.timestampToArray).toHaveBeenNthCalledWith(1, 1337)
// 	})
//
// 	it('should properly implement the timestampToArray method - unknown timezone', () => {
// 		const timezone = {
// 			calendarJsTimezone: true,
// 			tzid: 'America/New_York',
// 			timestampToArray: jest.fn().mockReturnValue([2019, 1, 1, 14, 30, 0])
// 		}
//
// 		const getTimezoneForId = jest.fn()
// 			.mockReturnValueOnce(null)
// 			.mockReturnValue(timezone)
//
// 		getTimezoneManager
// 			.mockReturnValue({
// 				getTimezoneForId
// 			})
//
// 		const VTimezoneNamedTimezone = createPlugin.mock.calls[0][0].namedTimeZonedImpl
// 		const instance = new VTimezoneNamedTimezone('America/New_York')
// 		instance.timeZoneName = 'America/New_York'
//
// 		const result = instance.timestampToArray(1337)
//
// 		expect(result).toEqual([2019, 0, 1, 14, 30, 0])
//
// 		expect(getTimezoneForId).toHaveBeenCalledTimes(2)
// 		expect(getTimezoneForId).toHaveBeenNthCalledWith(1, 'America/New_York')
// 		expect(getTimezoneForId).toHaveBeenNthCalledWith(2, 'UTC')
// 		expect(timezone.timestampToArray).toHaveBeenCalledTimes(1)
// 		expect(timezone.timestampToArray).toHaveBeenNthCalledWith(1, 1337)
// 	})
//
// })
